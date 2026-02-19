import React from 'react';
import { vi } from 'vitest';

// Mock all motion components as plain HTML elements
const createMotionComponent = (element: string) => {
    return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
        const {
            initial: _initial,
            animate: _animate,
            exit: _exit,
            transition: _transition,
            whileHover: _whileHover,
            whileTap: _whileTap,
            whileInView: _whileInView,
            variants: _variants,
            layout: _layout,
            layoutId: _layoutId,
            ...rest
        } = props;
        return React.createElement(element, { ...rest, ref });
    });
};

export const motion = new Proxy(
    {},
    {
        get: (_target, prop: string) => createMotionComponent(prop),
    }
);

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
);

export const useInView = () => true;
export const useScroll = () => ({ scrollYProgress: { get: () => 0 } });
export const useTransform = (_value: unknown, _input: unknown, output: number[]) => output?.[1] ?? 1;
export const useAnimation = () => ({ start: vi.fn(), stop: vi.fn() });
export const useMotionValue = (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
});
export const useSpring = (value: unknown) => value;
