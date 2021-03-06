/*!
   Copyright 2018 Propel http://propel.site/.  All rights reserved.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

// React wrapper around CodeMirror editor.

// tslint:disable:no-reference
/// <reference path="../../node_modules/@types/codemirror/index.d.ts" />

import { Component, h } from "preact";
import { normalizeCode } from "./common";

const codeMirrorElements = new Map<string, Element>();

const defaultOptions = {
  lineNumbers: false,
  lineWrapping: true,
  mode: "javascript",
  scrollbarStyle: null,
  theme: "syntax",
  viewportMargin: Infinity
};

export interface CodeMirrorProps {
  code: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onAltEnter?: () => void;
  onShiftEnter?: () => void;
  onCtrlEnter?: () => void;
  onChange?: (code: string) => void;
  id?: string;
}
export interface CodeMirrorState {}

export class CodeMirrorComponent extends Component<
  CodeMirrorProps,
  CodeMirrorState
> {
  editor: CodeMirror.Editor;
  pre: Element;

  get code(): string {
    return normalizeCode(
      this.editor ? this.editor.getValue() : this.props.code
    );
  }

  // Because CodeMirror has a lot of state that is not managed through
  // React, manually apply prop changes.
  componentWillReceiveProps(nextProps: CodeMirrorProps) {
    const nextCode = normalizeCode(nextProps.code);
    if (nextCode !== this.code) {
      this.editor.setValue(nextCode);
    }
  }

  // Because CodeMirror has complex internal state we don't use React.
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  blur() {
    this.editor.getInputField().blur();
  }

  focus() {
    this.editor.getInputField().focus();
  }

  componentDidMount() {
    const options = Object.assign({}, defaultOptions, {
      mode: "javascript",
      value: this.code
    });

    // tslint:disable-next-line:variable-name
    const CodeMirror = require("codemirror");
    require("codemirror/mode/javascript/javascript.js");

    // Find pre to replace by codemirror instance.
    const pre = this.pre;
    const parentEl = pre.parentElement;
    const id = this.props.id;

    if (id && codeMirrorElements.has(id)) {
      const el = codeMirrorElements.get(id);
      parentEl.replaceChild(el, pre);
      this.editor = el["CodeMirror"] as CodeMirror.Editor;
      return;
    }

    this.editor = CodeMirror(div => {
      parentEl.replaceChild(div, pre);
      if (id) codeMirrorElements.set(id, div);
    }, options);
    this.editor.setOption("extraKeys", {
      "Alt-Enter": () => {
        if (this.props.onAltEnter) this.props.onAltEnter();
        return true;
      },
      "Ctrl-Enter": () => {
        if (this.props.onCtrlEnter) this.props.onCtrlEnter();
        return true;
      },
      "Shift-Enter": () => {
        if (this.props.onShiftEnter) this.props.onShiftEnter();
        return true;
      }
    });

    this.editor.on("focus", () => {
      if (this.props.onFocus) this.props.onFocus();
    });

    this.editor.on("blur", () => {
      if (this.props.onBlur) this.props.onBlur();
    });

    this.editor.on("change", () => {
      if (this.props.onChange) this.props.onChange(this.code);
    });
  }

  render() {
    return (
      <pre
        ref={ref => {
          this.pre = ref;
        }}
      >
        {this.code}
      </pre>
    );
  }
}
