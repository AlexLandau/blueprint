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

import { Classes, Switch } from "@blueprintjs/core";
import { BaseExample, handleBooleanChange, handleStringChange } from "@blueprintjs/docs";
import * as React from "react";

import { DateRangeInput } from "../src";
import { FORMATS, FormatSelect } from "./common/formatSelect";

export interface IDateRangeInputExampleState {
    allowSingleDayRange?: boolean;
    closeOnSelection?: boolean;
    contiguousCalendarMonths?: boolean;
    disabled?: boolean;
    format?: string;
    selectAllOnFocus?: boolean;
}

export class DateRangeInputExample extends BaseExample<IDateRangeInputExampleState> {
    public state: IDateRangeInputExampleState = {
        allowSingleDayRange: false,
        closeOnSelection: false,
        contiguousCalendarMonths: true,
        disabled: false,
        format: FORMATS[0],
        selectAllOnFocus: false,
    };

    private toggleContiguous = handleBooleanChange(contiguous => {
        this.setState({ contiguousCalendarMonths: contiguous });
    });
    private toggleDisabled = handleBooleanChange(disabled => this.setState({ disabled }));
    private toggleFormat = handleStringChange(format => this.setState({ format }));
    private toggleSelection = handleBooleanChange(closeOnSelection => this.setState({ closeOnSelection }));
    private toggleSelectAllOnFocus = handleBooleanChange(selectAllOnFocus => this.setState({ selectAllOnFocus }));
    private toggleSingleDay = handleBooleanChange(allowSingleDayRange => this.setState({ allowSingleDayRange }));

    protected renderExample() {
        return <DateRangeInput {...this.state} />;
    }

    protected renderOptions() {
        return [
            [<FormatSelect key="Format" onChange={this.toggleFormat} selectedValue={this.state.format} />],
            [
                <label className={Classes.LABEL} key="modifierslabel">
                    Modifiers
                </label>,
                <Switch
                    checked={this.state.allowSingleDayRange}
                    label="Allow single day range"
                    key="Allow single day range"
                    onChange={this.toggleSingleDay}
                />,
                <Switch
                    checked={this.state.closeOnSelection}
                    label="Close on selection"
                    key="Selection"
                    onChange={this.toggleSelection}
                />,
                <Switch
                    checked={this.state.contiguousCalendarMonths}
                    label="Constrain calendar to contiguous months"
                    key="Constraint calendar to contiguous months"
                    onChange={this.toggleContiguous}
                />,
                <Switch checked={this.state.disabled} label="Disabled" key="Disabled" onChange={this.toggleDisabled} />,
                <Switch
                    checked={this.state.selectAllOnFocus}
                    label="Select all on focus"
                    key="Select all on focus"
                    onChange={this.toggleSelectAllOnFocus}
                />,
            ],
        ];
    }
}
