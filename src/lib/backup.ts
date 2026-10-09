import type { Outcome, TouchKind } from '#lib/today.svelte.js'

export type Backup = {
	format: 'looops-backup'
	version: 1
	exportedAt: string
	sample: boolean
	outcomes: Outcome[]
}

const touchKinds = new Set<TouchKind>(['asked', 'nudged', 'replied'])
const statuses = new Set<Outcome['status']>(['open', 'complete', 'cancelled'])

export function createBackup(outcomes: Outcome[], sample: boolean, when = new Date()): Backup {
	return {
		format: 'looops-backup',
		version: 1,
		exportedAt: when.toISOString(),
		sample,
		outcomes
	}
}

export function serializeBackup(backup: Backup): string {
	return `${JSON.stringify(backup, null, 2)}\n`
}

export function backupFilename(when = new Date()): string {
	const month = String(when.getMonth() + 1).padStart(2, '0')
	const day = String(when.getDate()).padStart(2, '0')
	return `looops-${when.getFullYear()}-${month}-${day}.json`
}

export function backupSummary(backup: Backup): string {
	const count = backup.outcomes.length === 1 ? '1 outcome' : `${backup.outcomes.length} outcomes`
	const exported = new Date(backup.exportedAt)
	if (Number.isNaN(exported.getTime())) return count
	return `${count}, exported ${exported.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.`
}

export function parseBackup(raw: string): Backup {
	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		throw new Error('This file is not a Looops backup.')
	}
	if (!isRecord(parsed) || parsed.format !== 'looops-backup' || parsed.version !== 1 || !Array.isArray(parsed.outcomes)) {
		throw new Error('This file is not a Looops backup.')
	}
	return {
		format: 'looops-backup',
		version: 1,
		exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
		sample: parsed.sample === true,
		outcomes: parsed.outcomes.map(readOutcome)
	}
}

function readOutcome(value: unknown): Outcome {
	if (!isRecord(value) || !text(value.id) || !text(value.title) || !statuses.has(value.status as Outcome['status'])) {
		throw new Error('This file is not a Looops backup.')
	}
	if (!Array.isArray(value.threads)) throw new Error('This file is not a Looops backup.')
	return {
		id: value.id,
		title: value.title,
		status: value.status as Outcome['status'],
		threads: value.threads.map(readThread)
	}
}

function readThread(value: unknown) {
	if (
		!isRecord(value) ||
		!text(value.id) ||
		!text(value.person) ||
		!text(value.ask) ||
		!instant(value.nextNudgeAt) ||
		typeof value.resolved !== 'boolean' ||
		!Array.isArray(value.touches)
	) {
		throw new Error('This file is not a Looops backup.')
	}
	return {
		id: value.id,
		person: value.person,
		ask: value.ask,
		nextNudgeAt: value.nextNudgeAt,
		resolved: value.resolved,
		touches: value.touches.map(readTouch)
	}
}

function readTouch(value: unknown) {
	if (!isRecord(value) || !text(value.id) || !instant(value.at) || !touchKinds.has(value.kind as TouchKind)) {
		throw new Error('This file is not a Looops backup.')
	}
	return { id: value.id, at: value.at, kind: value.kind as TouchKind }
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0
}

function instant(value: unknown): value is string {
	return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}
