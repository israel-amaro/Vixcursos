import { ReactNode, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';

type BaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  tone?: 'brand' | 'light' | 'ink';
};

type ButtonProps = BaseProps & {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  'aria-label'?: string;
};

type AnchorProps = BaseProps & {
  as: 'a';
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
};

type LinkProps = BaseProps & {
  as: 'link';
  to: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
};

export type MotionPillProps = ButtonProps | AnchorProps | LinkProps;

export default function MotionPill(props: MotionPillProps) {
  const reduced = useReducedMotion();
  const bounds = useRef<DOMRect | null>(null);
  const tone = props.tone ?? 'brand';

  const pointerHandlers = {
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && !reduced) {
        bounds.current = event.currentTarget.getBoundingClientRect();
      }
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse' || reduced || !bounds.current) return;
      const box = bounds.current;
      const dx = (event.clientX - box.left - box.width / 2) * 0.14;
      const dy = (event.clientY - box.top - box.height / 2) * 0.22;
      event.currentTarget.style.translate = `${dx}px ${dy}px`;
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      event.currentTarget.style.translate = '';
      bounds.current = null;
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      event.currentTarget.style.translate = '';
      bounds.current = null;
    },
  };

  const inner = (
    <>
      <span className="pill-label">
        <span>{props.children}</span>
        <span aria-hidden="true">{props.children}</span>
      </span>
      {props.icon}
    </>
  );

  const classes = `btn-primary motion-pill ${props.className ?? ''}`.trim();

  if (props.as === 'a') {
    return (
      <a
        href={props.href}
        onClick={props.onClick}
        aria-label={props['aria-label']}
        data-tone={tone}
        className={classes}
        {...pointerHandlers}
      >
        {inner}
      </a>
    );
  }

  if (props.as === 'link') {
    return (
      <Link
        to={props.to}
        onClick={props.onClick}
        aria-label={props['aria-label']}
        data-tone={tone}
        className={classes}
        {...pointerHandlers}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
      aria-label={props['aria-label']}
      data-tone={tone}
      className={classes}
      {...pointerHandlers}
    >
      {inner}
    </button>
  );
}
