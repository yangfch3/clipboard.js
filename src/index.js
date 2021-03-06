import { isString, contain, inheritPrototype, toArray, getData, setData } from './lib/utils';
import Publisher from './lib/observer';
import fakeInput from './lib/fakeInput';

const VERSION = '<@VERSION@>';

let _clipboardList = [];
let _triggers = [];

inheritPrototype(Clipboard, Publisher);

function exec(e) {
    if (contain(_triggers, e.target)) {
        let clipboard = _clipboardList[_triggers.indexOf(e.target)];
        let prop = clipboard.trigger.innerHTML ? 'innerHTML' : 'value';
        let originalText = clipboard.trigger[prop];

        if (clipboard.type === 1) {
            clipboard.target.select();
            try {
                document.execCommand(clipboard.action);
                clipboard.target.blur();
                clipboard.notify('success', clipboard);
                clipboard.trigger[prop] = 'OK!️';
                clipboard.trigger.disabled = true;
                setTimeout(function () {
                    clipboard.trigger[prop] = originalText;
                    clipboard.trigger.disabled = false;
                }, 1500);
            } catch (e) {
                clipboard.notify('error', clipboard);
            }
        } else if (clipboard.type === 2) {
            let text = clipboard.target.innerHTML;
            fakeInput.value = text;
            fakeInput.select();
            try {
                document.execCommand(clipboard.action);
                fakeInput.blur();
                clipboard.notify('success', clipboard);
                clipboard.trigger[prop] = 'OK!️';
                clipboard.trigger.disabled = true;
                setTimeout(function () {
                    clipboard.trigger[prop] = originalText;
                    clipboard.trigger.disabled = false;
                }, 1500);
            } catch (e) {
                fakeInput.blur();
                alert('error');
                clipboard.notify('error', clipboard);
            }
        }
    }
}

function Clipboard(ele) {
    // 实现继承
    Publisher.call(this);

    let trigger = isString(ele) ? document.querySelector(ele) : ele;

    // 按钮已注册过时
    if (getData(trigger, 'registered')) {
        return _clipboardList[_triggers.indexOf(trigger)];
    }
    let target = document.querySelector(getData(trigger, 'clipboard-target'));
    let action, type;

    if (/input|textarea/g.test(target.nodeName.toLowerCase())) {
        action = getData(trigger, 'clipboard-action') === 'cut' ? 'cut' : 'copy';
        type = 1;
    } else {
        action = 'copy';
        type = 2;
    }

    this.trigger = trigger;
    this.target = target;
    this.action = action;
    this.type = type;

    _clipboardList.push(this);
    _triggers.push(trigger);

    setData(trigger, 'registered', 'true');

    return this;
}

Clipboard.ver = Clipboard.version = VERSION;

Clipboard.init = function (className) {
    let btns = toArray(document.querySelectorAll(`.${className}`));

    for (let i = 0, len = btns.length; i < len; i++) {
        /* eslint-disable no-new */
        new Clipboard(btns[i]);
        /* eslint-enable no-new */
    }
    return _clipboardList;
};

Clipboard.prototype.destroy = function () {
    let that = this;
    let index = _clipboardList.indexOf(that);

    if (index > -1) {
        _clipboardList.splice(index, 1);
        _triggers.splice(index, 1);
        return true;
    }

    return false;
};

window.addEventListener('click', exec, false);

export default Clipboard;
