/**
 * page_injector.js — Runs in the PAGE's main world (not isolated content script).
 * Provides React Fiber / DraftJS state-level text injection so frameworks
 * register the value change and enable the Send button.
 *
 * Communication: listens for a custom DOM event dispatched by content.js.
 */
(function () {
  'use strict';

  /**
   * Find the React Fiber node attached to a DOM element.
   */
  function getReactFiber(el) {
    if (!el) return null;
    const key = Object.keys(el).find(
      k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$')
    );
    return key ? el[key] : null;
  }

  /**
   * Find the React Props attached to a DOM element.
   */
  function getReactProps(el) {
    if (!el) return null;
    const key = Object.keys(el).find(k => k.startsWith('__reactProps$'));
    return key ? el[key] : null;
  }

  /**
   * Walk up the Fiber tree looking for a state node with an onChange / setValue handler.
   */
  function findStateHandler(fiber) {
    let node = fiber;
    let depth = 0;
    while (node && depth < 30) {
      // Check memoizedProps for onChange handlers
      if (node.memoizedProps) {
        if (typeof node.memoizedProps.onChange === 'function') {
          return { type: 'onChange', handler: node.memoizedProps.onChange, fiber: node };
        }
        if (typeof node.memoizedProps.onInput === 'function') {
          return { type: 'onInput', handler: node.memoizedProps.onInput, fiber: node };
        }
      }
      // Check stateNode for Draft.js editor
      if (node.stateNode && node.stateNode._onChangeEditorState) {
        return { type: 'draftjs', handler: node.stateNode._onChangeEditorState, fiber: node };
      }
      node = node.return;
      depth++;
    }
    return null;
  }

  /**
   * Attempt to inject text using React's native setter to bypass the
   * synthetic event system that may swallow standard DOM events.
   */
  function reactInject(target, text) {
    try {
      // Strategy 1: Use React's own onChange via a synthetic-like event
      const props = getReactProps(target);
      if (props && typeof props.onChange === 'function') {
        // Set the native value first
        const proto = target.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(target, text);
        } else {
          target.value = text;
        }
        // Fire React's onChange with a minimal synthetic event
        props.onChange({ target, currentTarget: target, type: 'change' });
        return true;
      }

      // Strategy 2: Walk the Fiber tree for a handler
      const fiber = getReactFiber(target);
      if (fiber) {
        const found = findStateHandler(fiber);
        if (found) {
          if (found.type === 'onChange' || found.type === 'onInput') {
            const proto2 = target.tagName === 'TEXTAREA'
              ? window.HTMLTextAreaElement.prototype
              : window.HTMLInputElement.prototype;
            const setter2 = Object.getOwnPropertyDescriptor(proto2, 'value')?.set;
            if (setter2) setter2.call(target, text);
            else target.value = text;
            found.handler({ target, currentTarget: target, type: found.type === 'onChange' ? 'change' : 'input' });
            return true;
          }
        }
      }

      // Strategy 3: ContentEditable / DraftJS
      if (target.isContentEditable || target.getAttribute('role') === 'textbox') {
        target.focus();
        // Select all existing content and replace
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        sel.removeAllRanges();
        sel.addRange(range);
        const ok = document.execCommand('insertText', false, text);
        if (!ok) {
          target.textContent = text;
        }
        // Dispatch input event for framework listeners
        target.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: text, inputType: 'insertText' }));
        return true;
      }

      return false;
    } catch (e) {
      console.warn('[BlastChat PageInjector] React inject error:', e);
      return false;
    }
  }

  // Listen for injection requests from the content script
  window.addEventListener('blastchat-inject', function (e) {
    const { text, targetSelector } = e.detail || {};
    if (!text) return;

    let target = null;

    // Try to find target by selector if provided
    if (targetSelector) {
      target = document.querySelector(targetSelector);
    }

    // Fallback: find the active/focused input
    if (!target) {
      target = document.activeElement;
    }

    // Fallback: search for visible inputs
    if (!target || target === document.body) {
      const candidates = document.querySelectorAll(
        'textarea, [contenteditable="true"], [role="textbox"], .public-DraftEditor-content, input[type="text"]'
      );
      for (const el of candidates) {
        if (el.offsetParent !== null && !el.disabled) {
          target = el;
          break;
        }
      }
    }

    if (!target) {
      console.warn('[BlastChat PageInjector] No target element found');
      return;
    }

    target.focus();
    const success = reactInject(target, text);

    if (!success) {
      // Final fallback: brute-force value assignment + event dispatch
      if ('value' in target) {
        const proto = target.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (setter) setter.call(target, text);
        else target.value = text;
      } else {
        target.textContent = text;
      }
      ['input', 'change', 'keydown', 'keyup', 'blur'].forEach(type => {
        target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      });
    }

    // Signal success back to content script
    window.dispatchEvent(new CustomEvent('blastchat-inject-result', { detail: { success: true } }));
  });

  console.log('[BlastChat PageInjector] React/DraftJS injection bridge loaded.');
})();
