/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as classNames from "classnames";
import * as PureRender from "pure-render-decorator";
import * as React from "react";

import {
    Classes as CoreClasses,
    HTMLInputProps,
    IBackdropProps,
    IInputGroupProps,
    InputGroup,
    IOverlayableProps,
    IOverlayProps,
    Menu,
    Overlay,
    Utils,
} from "@blueprintjs/core";

import * as Classes from "../../common/classes";
import { IListItemsProps, IQueryListRendererProps, QueryList } from "../query-list/queryList";
import { ISelectItemRendererProps } from "../select/select";

export interface IOmniboxProps<T> extends IListItemsProps<T> {
    /**
     * React child to render when query is empty.
     */
    initialContent?: React.ReactChild;

    /**
     * Custom renderer for an item in the dropdown list. Receives a boolean indicating whether
     * this item is active (selected by keyboard arrows) and an `onClick` event handler that
     * should be attached to the returned element.
     */
    itemRenderer: (itemProps: ISelectItemRendererProps<T>) => JSX.Element;

    /** React child to render when filtering items returns zero results. */
    noResults?: React.ReactChild;

    /**
     * Props to spread to `InputGroup`. All props are supported except `ref` (use `inputRef` instead).
     * If you want to control the filter input, you can pass `value` and `onChange` here
     * to override `Select`'s own behavior.
     */
    inputProps?: IInputGroupProps & HTMLInputProps;

    /**
     * Toggles the visibility of the omnibox.
     * This prop is required because the component is controlled.
     */
    isOpen: boolean;

    /**
     * A callback that is invoked when user interaction causes the overlay to close, such as
     * clicking on the overlay or pressing the `esc` key (if enabled).
     * Receives the event from the user's interaction, if there was an event (generally either a
     * mouse or key event). Note that, since this component is controlled by the `isOpen` prop, it
     * will not actually close itself until that prop becomes `false`.
     */
    onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;

    /** Props to spread to `Overlay`. Note that `content` cannot be changed. */
    overlayProps?: Partial<IOverlayProps> & object;

    /**
     * Whether the filtering state should be reset to initial when an item is selected
     * (immediately before `onItemSelect` is invoked). The query will become the empty string
     * and the first item will be made active.
     * @default false
     */
    resetOnSelect?: boolean;
}

export interface IOmniboxState<T> extends IOverlayableProps, IBackdropProps {
    activeItem?: T;
    query?: string;
}

@PureRender
export class Omnibox<T> extends React.Component<IOmniboxProps<T>, IOmniboxState<T>> {
    public static displayName = "Blueprint.Omnibox";

    public static ofType<T>() {
        return Omnibox as new () => Omnibox<T>;
    }

    public state: IOmniboxState<T> = {
        query: "",
    };

    private TypedQueryList = QueryList.ofType<T>();
    private queryList: QueryList<T>;
    private refHandlers = {
        queryList: (ref: QueryList<T>) => (this.queryList = ref),
    };

    public render() {
        // omit props specific to this component, spread the rest.
        const { initialContent, isOpen, itemRenderer, inputProps, noResults, overlayProps, ...restProps } = this.props;

        return (
            <this.TypedQueryList
                {...restProps}
                activeItem={this.state.activeItem}
                onActiveItemChange={this.handleActiveItemChange}
                onItemSelect={this.handleItemSelect}
                query={this.state.query}
                ref={this.refHandlers.queryList}
                renderer={this.renderQueryList}
            />
        );
    }

    public componentWillReceiveProps(nextProps: IOmniboxProps<T>) {
        const { isOpen } = nextProps;
        const canClearQuery = !this.props.isOpen && isOpen && this.props.resetOnSelect;

        this.setState({
            activeItem: canClearQuery ? this.props.items[0] : this.state.activeItem,
            query: canClearQuery ? "" : this.state.query,
        });
    }

    private renderQueryList = (listProps: IQueryListRendererProps<T>) => {
        const { inputProps = {}, isOpen, overlayProps = {} } = this.props;
        const { ref, ...htmlInputProps } = inputProps;
        const { handleKeyDown, handleKeyUp } = listProps;
        const handlers = isOpen && !this.isQueryEmpty() ? { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp } : {};

        return (
            <Overlay
                hasBackdrop={true}
                {...overlayProps}
                isOpen={isOpen}
                className={classNames(overlayProps.className, Classes.OMNIBOX_OVERLAY)}
                onClose={this.handleOverlayClose}
            >
                <div className={classNames(listProps.className, Classes.OMNIBOX)} {...handlers}>
                    <InputGroup
                        autoFocus={true}
                        className={CoreClasses.LARGE}
                        leftIconName="search"
                        placeholder="Search..."
                        value={listProps.query}
                        {...htmlInputProps}
                        onChange={this.handleQueryChange}
                    />
                    {this.maybeRenderMenu(listProps)}
                </div>
            </Overlay>
        );
    };

    private renderItems({ activeItem, filteredItems, handleItemSelect }: IQueryListRendererProps<T>) {
        const { itemRenderer, noResults } = this.props;
        if (filteredItems.length === 0) {
            return noResults;
        }
        return filteredItems.map((item, index) =>
            itemRenderer({
                handleClick: e => handleItemSelect(item, e),
                index,
                isActive: item === activeItem,
                item,
            }),
        );
    }

    private maybeRenderMenu(listProps: IQueryListRendererProps<T>) {
        const { initialContent } = this.props;
        let menuChildren: any;

        if (!this.isQueryEmpty()) {
            menuChildren = this.renderItems(listProps);
        } else if (initialContent != null) {
            menuChildren = initialContent;
        }

        if (menuChildren != null) {
            return <Menu ulRef={listProps.itemsParentRef}>{menuChildren}</Menu>;
        }

        return undefined;
    }

    private isQueryEmpty = () => this.state.query.length === 0;

    private handleActiveItemChange = (activeItem: T) => this.setState({ activeItem });

    private handleItemSelect = (item: T, event: React.SyntheticEvent<HTMLElement>) => {
        if (!this.isQueryEmpty()) {
            Utils.safeInvoke(this.props.onItemSelect, item, event);
        }
    };

    private handleQueryChange = (event: React.FormEvent<HTMLInputElement>) => {
        const { inputProps = {} } = this.props;
        this.setState({ query: event.currentTarget.value });
        Utils.safeInvoke(inputProps.onChange, event);
    };

    private handleOverlayClose = (event: React.SyntheticEvent<HTMLElement>) => {
        Utils.safeInvoke(this.props.onClose, event);
    };
}
