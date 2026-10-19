import { themeChoices, themeIcons, themeLabels } from '../theme'
import type { ThemeChoice } from '../theme'

import { SegmentedButton } from './segmented-button'

const options = themeChoices.map((value) => ({ value, label: themeLabels[value], icon: themeIcons[value] }))

type ThemePickerProps = { value: ThemeChoice; onValueChange: (value: ThemeChoice) => void }

export function ThemePicker({ value, onValueChange }: ThemePickerProps) {
	return (
		<div className="grid w-theme-picker max-w-[calc(100vw---spacing(8))] py-1">
			<SegmentedButton label="Theme" options={options} value={value} onValueChange={onValueChange} />
		</div>
	)
}
