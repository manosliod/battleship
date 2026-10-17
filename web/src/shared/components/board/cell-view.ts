export type CellContent = 'water' | 'ship' | 'miss' | 'hit' | 'sunk' | 'aimed' | 'preview' | 'invalid'

export type CellView = Readonly<{ content: CellContent; enabled: boolean }>

export const contentLabels = {
	water: 'water',
	ship: 'ship',
	miss: 'miss',
	hit: 'hit',
	sunk: 'sunk',
	aimed: 'aimed',
	preview: 'ship preview',
	invalid: 'does not fit'
} as const satisfies Record<CellContent, string>
