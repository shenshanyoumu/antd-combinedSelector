import React from 'react';
import renderer from 'react-test-renderer';

export default function focusTest(Component) {
  describe('focus and blur', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    let container;
    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('focus() and onFocus', () => {
      const handleFocus = jest.fn();
      const wrapper = renderer.create(<Component onFocus={handleFocus} />, {
        attachTo: container,
      });
      wrapper.instance().focus();
      jest.runAllTimers();
      expect(handleFocus).toBeCalled();
    });

    it('blur() and onBlur', () => {
      const handleBlur = jest.fn();
      const wrapper = renderer.create(
        <Component onBlur={handleBlur} id="test" />,
        {
          attachTo: container,
        }
      );
      wrapper.instance().focus();
      jest.runAllTimers();
      wrapper.instance().blur();
      jest.runAllTimers();
      expect(handleBlur).toBeCalled();
    });

    it('autoFocus', () => {
      const handleFocus = jest.fn();
      renderer.create(<Component autoFocus onFocus={handleFocus} />, {
        attachTo: container,
      });
      jest.runAllTimers();
      expect(handleFocus).toBeCalled();
    });
  });
}
