/**
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
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
import * as React from "react";
import * as Classes from "../common/classes";

import { Classes as CoreClasses, IIntentProps, IProps, Utils as CoreUtils } from "@blueprintjs/core";

import { LoadableContent } from "../common/loadableContent";
import { JSONFormat } from "./formats/jsonFormat";
import { TruncatedFormat } from "./formats/truncatedFormat";

export interface ICellProps extends IIntentProps, IProps {
    key?: string;

    style?: React.CSSProperties;

    /**
     * The column index of the cell. If provided, this will be passed as an argument to any callbacks
     * when they are invoked.
     */
    columnIndex?: number;

    /**
     * If `true`, the cell will be rendered above overlay layers to enable mouse
     * interactions within the cell.
     * @default false
     */
    interactive?: boolean;

    /**
     * An optional native tooltip that is displayed on hover.
     * If `true`, content will be replaced with a fixed-height skeleton.
     * @default false
     */
    loading?: boolean;

    /**
     * The row index of the cell. If provided, this will be passed as an argument to any callbacks
     * when they are invoked.
     */
    rowIndex?: number;

    /**
     * An optional native tooltip that is displayed on hover.
     */
    tooltip?: string;

    /**
     * If `true`, the cell contents will be wrapped in a `div` with
     * styling that will prevent the content from overflowing the cell.
     * @default true
     */
    truncated?: boolean;

    /**
     * If `true`, the cell contents will be wrapped in a `div` with
     * styling that will cause text to wrap, rather than displaying it on a single line.
     * @default false
     */
    wrapText?: boolean;

    /**
     * Allows for setting a tab index on the cell, so the cell can be browser-focusable.
     */
    tabIndex?: number;

    /**
     * Callback invoked when the cell is focused and a key is pressed down.
     */
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>;

    /**
     * Callback invoked when the cell is focused and a key is released.
     */
    onKeyUp?: React.KeyboardEventHandler<HTMLElement>;

    /**
     * A ref handle to capture the outer div of this cell. Used internally.
     */
    cellRef?: (ref: HTMLElement) => void;
}

export type ICellRenderer = (rowIndex: number, columnIndex: number) => React.ReactElement<ICellProps>;

export const emptyCellRenderer = () => <Cell />;

export class Cell extends React.Component<ICellProps, {}> {
    public static defaultProps = {
        truncated: true,
        wrapText: false,
    };

    public shouldComponentUpdate(nextProps: ICellProps) {
        // deeply compare "style," because a new but identical object might have been provided.
        return (
            !CoreUtils.shallowCompareKeys(this.props, nextProps, { exclude: ["style"] }) ||
            !CoreUtils.deepCompareKeys(this.props.style, nextProps.style)
        );
    }

    public render() {
        const {
            cellRef,
            tabIndex,
            onKeyDown,
            onKeyUp,
            style,
            intent,
            interactive,
            loading,
            tooltip,
            truncated,
            className,
            wrapText,
        } = this.props;

        const classes = classNames(
            Classes.TABLE_CELL,
            CoreClasses.intentClass(intent),
            {
                [Classes.TABLE_CELL_INTERACTIVE]: interactive,
                [CoreClasses.LOADING]: loading,
                [Classes.TABLE_TRUNCATED_CELL]: truncated,
            },
            className,
        );

        const textClasses = classNames({
            [Classes.TABLE_TRUNCATED_TEXT]: truncated,
            [Classes.TABLE_NO_WRAP_TEXT]: !wrapText,
        });

        // add width and height to the children, for use in shouldComponentUpdate in truncatedFormat
        // note: these aren't actually used by truncated format, just in shouldComponentUpdate
        const modifiedChildren = React.Children.map(this.props.children, child => {
            if (style != null && React.isValidElement(child)) {
                const childType = child.type;
                // can't get prototype of "string" child, so treat those separately
                if (typeof child === "string" || typeof childType === "string") {
                    return child;
                } else {
                    const isTruncatedFormat =
                        childType.prototype === TruncatedFormat.prototype ||
                        TruncatedFormat.prototype.isPrototypeOf(childType) ||
                        childType.prototype === JSONFormat.prototype ||
                        JSONFormat.prototype.isPrototypeOf(childType);
                    // only add props if child is truncated format
                    if (isTruncatedFormat) {
                        return React.cloneElement(child as React.ReactElement<any>, {
                            parentCellHeight: style.height,
                            parentCellWidth: style.width,
                        });
                    }
                }
            }
            return child;
        });

        const content = <div className={textClasses}>{modifiedChildren}</div>;

        return (
            <div className={classes} title={tooltip} ref={cellRef} {...{ style, tabIndex, onKeyDown, onKeyUp }}>
                <LoadableContent loading={loading} variableLength={true}>
                    {content}
                </LoadableContent>
            </div>
        );
    }
}
