/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
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

import { assert } from "chai";

import { Position } from "../../src/common/position";
import * as TetherUtils from "../../src/common/tetherUtils";

describe("TetherUtils", () => {
    describe("getAttachmentClasses", () => {
        it("generates expected classes for Position.TOP", () => {
            assert.deepEqual(TetherUtils.getAttachmentClasses(Position.TOP), [
                "pt-tether-element-attached-bottom",
                "pt-tether-element-attached-center",
                "pt-tether-target-attached-top",
                "pt-tether-target-attached-center",
            ]);
        });

        it("generates expected classes for Position.RIGHT_BOTTOM", () => {
            assert.deepEqual(TetherUtils.getAttachmentClasses(Position.RIGHT_BOTTOM), [
                "pt-tether-element-attached-bottom",
                "pt-tether-element-attached-left",
                "pt-tether-target-attached-bottom",
                "pt-tether-target-attached-right",
            ]);
        });
    });
});
