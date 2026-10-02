/**
 * Icon conventions (icons come from `lucide-react`).
 *
 * - Use these sizes and stroke instead of picking new ones per screen.
 * - Lucide hides icons from assistive tech by default. Decorative icons need nothing
 *   extra. An icon that is the only content of a control must get its accessible
 *   name from the control (IconButton's `label` prop), not from the icon.
 */
export const iconSize = {
  sm: 16, // inside small controls, badges, helper/error text
  md: 20, // default: buttons, inputs, navigation
  lg: 24, // empty states, standalone icons
} as const;

export const iconStroke = 1.75;

export type IconSize = keyof typeof iconSize;
