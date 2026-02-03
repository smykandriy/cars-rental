import { Link, type LinkProps } from 'react-router-dom'
import type { ComponentProps } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

type BaseProps = {
  variant?: ButtonVariant
  className?: string
}

type ButtonProps = BaseProps &
  ComponentProps<'button'> & {
    as?: 'button'
  }

type LinkButtonProps = BaseProps &
  LinkProps & {
    as: 'link'
  }

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger'
}

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = 'primary', className } = props
  const classes = `${variantClass[variant]} ${className || ''}`.trim()
  if (props.as === 'link') {
    const { as, variant: _variant, className: _className, ...rest } = props
    return (
      <Link className={classes} {...rest}>
        {rest.children}
      </Link>
    )
  }
  const { as, ...rest } = props
  return <button className={classes} {...rest} />
}
