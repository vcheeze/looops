export type When = 'today' | 'tomorrow'
export type TouchKind = 'asked' | 'nudged' | 'replied'

export type Touch = {
	id: string
	at: string
	kind: TouchKind
}

export type Thread = {
	id: string
	person: string
	ask: string
	nextNudgeAt: string
	resolved: boolean
	touches: Touch[]
}

export type Outcome = {
	id: string
	title: string
	status: 'open' | 'complete' | 'cancelled'
	threads: Thread[]
}

export type Due = {
	outcome: Outcome
	thread: Thread
}

type Persisted = {
	sample: boolean
	outcomes: Outcome[]
}

const KEY = 'looops.v1'

function uid(): string {
	return crypto.randomUUID()
}

function dayStart(date: Date): Date {
	const next = new Date(date)
	next.setHours(8, 0, 0, 0)
	return next
}

export function shift(when: When, from = new Date()): Date {
	const next = dayStart(from)
	if (when === 'tomorrow') next.setDate(next.getDate() + 1)
	return next
}

export function daysWaiting(thread: Thread, now = new Date()): number {
	const first = thread.touches.reduce((earliest, touch) =>
		touch.at < earliest ? touch.at : earliest, thread.touches[0]?.at ?? thread.nextNudgeAt)
	const start = new Date(first)
	const from = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
	const to = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
	return Math.max(0, Math.round((to - from) / 86_400_000))
}

export function waitLabel(days: number): string {
	if (days === 0) return 'Today'
	if (days === 1) return '1 day'
	return `${days} days`
}

export function formatDay(date: Date): string {
	return new Intl.DateTimeFormat(undefined, {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	}).format(date)
}

export function formatTouchDate(iso: string, now = new Date()): string {
	const date = new Date(iso)
	const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
	if (date.getFullYear() !== now.getFullYear()) options.year = 'numeric'
	return new Intl.DateTimeFormat(undefined, options).format(date)
}

export type DerivedStatus = 'waiting' | 'due' | 'paused' | 'complete'

export function derivedStatus(outcome: Outcome, now = new Date()): DerivedStatus {
	if (outcome.status === 'complete') return 'complete'
	if (outcome.status === 'cancelled') return 'paused'
	const end = new Date(now)
	end.setHours(23, 59, 59, 999)
	const due = outcome.threads.some(
		(thread) => !thread.resolved && Date.parse(thread.nextNudgeAt) <= end.getTime()
	)
	return due ? 'due' : 'waiting'
}

export function statusLabel(status: DerivedStatus): string {
	if (status === 'due') return 'Follow-up due'
	if (status === 'paused') return 'Paused'
	if (status === 'complete') return 'Complete'
	return 'Waiting'
}

const groupOrder: DerivedStatus[] = ['due', 'waiting', 'paused', 'complete']

export function outcomeGroups(outcomes: Outcome[], now = new Date()) {
	const buckets = new Map<DerivedStatus, Outcome[]>()
	for (const outcome of outcomes) {
		const status = derivedStatus(outcome, now)
		const list = buckets.get(status) ?? []
		list.push(outcome)
		buckets.set(status, list)
	}
	for (const [status, list] of buckets) list.sort((a, b) => compareOutcomes(a, b, status))
	return groupOrder
		.filter((status) => buckets.has(status))
		.map((status) => ({ status, label: statusLabel(status), items: buckets.get(status) ?? [] }))
}

function compareOutcomes(a: Outcome, b: Outcome, status: DerivedStatus): number {
	if (status === 'complete') return latestTouch(b) - latestTouch(a) || a.title.localeCompare(b.title)
	if (status === 'paused') return a.title.localeCompare(b.title)
	return soonestNudge(a) - soonestNudge(b) || a.title.localeCompare(b.title)
}

function soonestNudge(outcome: Outcome): number {
	const open = outcome.threads.filter((thread) => !thread.resolved)
	if (open.length === 0) return Number.POSITIVE_INFINITY
	return Math.min(...open.map((thread) => Date.parse(thread.nextNudgeAt)))
}

function latestTouch(outcome: Outcome): number {
	const times = outcome.threads.flatMap((thread) => thread.touches.map((touch) => Date.parse(touch.at)))
	if (times.length === 0) return 0
	return Math.max(...times)
}

export function outcomeSummary(outcome: Outcome): string {
	const open = openThreads(outcome)
	if (outcome.status === 'complete') {
		const last = story(outcome).at(-1)
		return last?.label ?? 'Done'
	}
	if (open.length === 0) return 'No one still has it'
	if (outcome.status === 'cancelled') return nameList(open.map((thread) => thread.person))
	const nudge = nudgeLine(open[0]).replace(/\.$/, '')
	return `${nameList(open.map((thread) => thread.person))} · ${nudge}`
}

function nameList(names: string[]): string {
	if (names.length <= 2) return names.join(' and ')
	return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
}

export function openThreads(outcome: Outcome): Thread[] {
	return outcome.threads
		.filter((thread) => !thread.resolved)
		.sort((a, b) => Date.parse(a.nextNudgeAt) - Date.parse(b.nextNudgeAt) || daysWaiting(b) - daysWaiting(a))
}

export function leadOpen(outcome: Outcome): Thread | undefined {
	return openThreads(outcome)[0]
}

export function isTomorrow(outcome: Outcome, now = new Date()): boolean {
	const lead = leadOpen(outcome)
	if (!lead) return false
	const end = new Date(now)
	end.setHours(23, 59, 59, 999)
	return Date.parse(lead.nextNudgeAt) > end.getTime()
}

export function nudgeLine(thread: Thread, now = new Date()): string {
	const next = new Date(thread.nextNudgeAt)
	const end = new Date(now)
	end.setHours(23, 59, 59, 999)
	if (next.getTime() <= end.getTime()) return "You'll nudge them today."
	return `You'll nudge them on ${formatDay(next)}.`
}

export function threadContext(thread: Thread): string {
	const days = daysWaiting(thread)
	const count = thread.touches.length
	const follows = count === 1 ? '1 follow-up' : `${count} follow-ups`
	if (days === 0) return `Asked today · ${follows}`
	return `Waiting ${waitLabel(days).toLowerCase()} · ${follows}`
}

export type StoryLine = {
	id: string
	at: string
	label: string
	detail: string
}

export function story(outcome: Outcome): StoryLine[] {
	return outcome.threads
		.flatMap((thread) =>
			thread.touches.map((touch) => ({
				id: touch.id,
				at: touch.at,
				label: touchPhrase(touch.kind, thread.person),
				detail: touch.kind === 'asked' ? thread.ask : ''
			}))
		)
		.sort((a, b) => a.at.localeCompare(b.at))
}

function touchPhrase(kind: TouchKind, person: string): string {
	if (kind === 'asked') return `Asked ${person}`
	if (kind === 'nudged') return `Nudged ${person}`
	return `${person} replied`
}

function waitingNotice(person: string, next: Date, now = new Date()): string {
	const sameDay =
		next.getFullYear() === now.getFullYear() &&
		next.getMonth() === now.getMonth() &&
		next.getDate() === now.getDate()
	if (sameDay) return `Waiting on ${person}. You'll nudge them today.`
	return `Waiting on ${person}. You'll nudge them on ${formatDay(next)}.`
}

function daysAgo(days: number): string {
	const date = new Date()
	date.setDate(date.getDate() - days)
	date.setHours(10, 0, 0, 0)
	return date.toISOString()
}

function sampleOutcomes(): Outcome[] {
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	return [
		{
			id: uid(),
			title: 'Renovation permit',
			status: 'open',
			threads: [
				{
					id: uid(),
					person: 'Alex',
					ask: 'Revised plans',
					nextNudgeAt: dayStart(yesterday).toISOString(),
					resolved: false,
					touches: [
						{ id: uid(), at: daysAgo(9), kind: 'asked' },
						{ id: uid(), at: daysAgo(4), kind: 'nudged' }
					]
				}
			]
		},
		{
			id: uid(),
			title: 'Sign the lease',
			status: 'open',
			threads: [
				{
					id: uid(),
					person: 'Sam',
					ask: 'Review the lease',
					nextNudgeAt: dayStart(new Date()).toISOString(),
					resolved: false,
					touches: [{ id: uid(), at: daysAgo(6), kind: 'asked' }]
				}
			]
		},
		{
			id: uid(),
			title: 'Book the dinner',
			status: 'open',
			threads: [
				{
					id: uid(),
					person: 'Mia',
					ask: 'Confirm the venue hold',
					nextNudgeAt: dayStart(new Date()).toISOString(),
					resolved: false,
					touches: [{ id: uid(), at: daysAgo(2), kind: 'asked' }]
				}
			]
		}
	]
}

function endOfToday(now = new Date()): number {
	const end = new Date(now)
	end.setHours(23, 59, 59, 999)
	return end.getTime()
}

function startOfDay(now = new Date()): number {
	const start = new Date(now)
	start.setHours(0, 0, 0, 0)
	return start.getTime()
}

function nudgeTimesToday(outcome: Outcome, now = new Date()): number[] {
	const start = startOfDay(now)
	const end = endOfToday(now)
	return outcome.threads.flatMap((thread) =>
		thread.touches
			.filter((touch) => touch.kind === 'nudged')
			.map((touch) => Date.parse(touch.at))
			.filter((at) => at >= start && at <= end)
	)
}

export function nudgedSummary(outcome: Outcome, now = new Date()): string {
	const start = startOfDay(now)
	const end = endOfToday(now)
	const names: string[] = []
	const nudged = outcome.threads
		.filter((thread) =>
			thread.touches.some((touch) => {
				if (touch.kind !== 'nudged') return false
				const at = Date.parse(touch.at)
				return at >= start && at <= end
			})
		)
		.sort((a, b) => latestNudge(b, start, end) - latestNudge(a, start, end))
	for (const thread of nudged) {
		if (!names.includes(thread.person)) names.push(thread.person)
	}
	return nameList(names)
}

function latestNudge(thread: Thread, start: number, end: number): number {
	const times = thread.touches
		.filter((touch) => touch.kind === 'nudged')
		.map((touch) => Date.parse(touch.at))
		.filter((at) => at >= start && at <= end)
	return times.length === 0 ? 0 : Math.max(...times)
}

class Queue {
	outcomes = $state<Outcome[]>([])
	sample = $state(false)

	constructor() {
		if (typeof localStorage === 'undefined') return
		this.restore()
	}

	get paused(): Outcome[] {
		return this.outcomes.filter((outcome) => outcome.status === 'cancelled')
	}

	get pending(): Outcome[] {
		return this.outcomes
			.filter((outcome) => outcome.status === 'open' && !isTomorrow(outcome))
			.sort((a, b) => soonestNudge(a) - soonestNudge(b) || a.title.localeCompare(b.title))
	}

	get nudgedToday(): Outcome[] {
		const actionable = new Set(this.pending.map((outcome) => outcome.id))
		return this.outcomes
			.filter(
				(outcome) =>
					outcome.status === 'open' && !actionable.has(outcome.id) && nudgeTimesToday(outcome).length > 0
			)
			.sort(
				(a, b) =>
					Math.max(...nudgeTimesToday(b)) - Math.max(...nudgeTimesToday(a)) || a.title.localeCompare(b.title)
			)
	}

	get due(): Due[] {
		const limit = endOfToday()
		return this.outcomes
			.filter((outcome) => outcome.status === 'open')
			.flatMap((outcome) =>
				outcome.threads
					.filter((thread) => !thread.resolved && Date.parse(thread.nextNudgeAt) <= limit)
					.map((thread) => ({ outcome, thread }))
			)
			.sort((a, b) => {
				const byNudge = Date.parse(a.thread.nextNudgeAt) - Date.parse(b.thread.nextNudgeAt)
				if (byNudge !== 0) return byNudge
				return daysWaiting(b.thread) - daysWaiting(a.thread)
			})
	}

	nudgeOutcome(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		const thread = leadOpen(outcome)
		if (!thread) return `${outcome.title} has no one to nudge.`
		return this.nudge(outcomeId, thread.id)
	}

	deferOutcome(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		const open = outcome.threads.filter((thread) => !thread.resolved)
		if (open.length === 0) return `${outcome.title} has no one waiting.`
		const next = shift('tomorrow')
		for (const thread of open) thread.nextNudgeAt = next.toISOString()
		this.save()
		return `${outcome.title} comes back tomorrow.`
	}

	nudge(outcomeId: string, threadId: string): string {
		const thread = this.thread(outcomeId, threadId)
		thread.touches.push({ id: uid(), at: new Date().toISOString(), kind: 'nudged' })
		let next = new Date(thread.nextNudgeAt)
		if (next.getTime() <= endOfToday()) {
			next = shift('tomorrow')
			thread.nextNudgeAt = next.toISOString()
		}
		this.save()
		return `Nudged ${thread.person}. You'll nudge them on ${formatDay(next)}.`
	}

	snooze(outcomeId: string, threadId: string, when: When): string {
		const thread = this.thread(outcomeId, threadId)
		const next = shift(when)
		thread.nextNudgeAt = next.toISOString()
		this.save()
		return `You'll nudge ${thread.person} on ${formatDay(next)}.`
	}

	repliedDone(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		this.replyOnOpenThreads(outcome)
		outcome.status = 'complete'
		this.save()
		return `${outcome.title} is done.`
	}

	repliedLater(outcomeId: string, threadId: string): string {
		const thread = this.thread(outcomeId, threadId)
		const next = shift('tomorrow')
		thread.touches.push({ id: uid(), at: new Date().toISOString(), kind: 'replied' })
		thread.nextNudgeAt = next.toISOString()
		this.save()
		return `${thread.person} still has it. It comes back tomorrow.`
	}

	setAside(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		this.replyOnOpenThreads(outcome)
		outcome.status = 'cancelled'
		this.save()
		return `${outcome.title} is set aside.`
	}

	handOff(outcomeId: string, threadId: string, person: string, ask: string, when: When): string {
		const outcome = this.outcome(outcomeId)
		const current = this.thread(outcomeId, threadId)
		const next = shift(when)
		current.touches.push({ id: uid(), at: new Date().toISOString(), kind: 'replied' })
		current.resolved = true
		const name = person.trim()
		outcome.threads.push({
			id: uid(),
			person: name,
			ask: ask.trim(),
			nextNudgeAt: next.toISOString(),
			resolved: false,
			touches: [{ id: uid(), at: new Date().toISOString(), kind: 'asked' }]
		})
		this.save()
		return waitingNotice(name, next)
	}

	find(id: string): Outcome | undefined {
		return this.outcomes.find((item) => item.id === id)
	}

	addThread(outcomeId: string, person: string, ask: string, when: When): string {
		const outcome = this.outcome(outcomeId)
		if (outcome.status !== 'open') return `${outcome.title} is not open.`
		const name = person.trim()
		const next = shift(when)
		outcome.threads.push({
			id: uid(),
			person: name,
			ask: ask.trim(),
			nextNudgeAt: next.toISOString(),
			resolved: false,
			touches: [{ id: uid(), at: new Date().toISOString(), kind: 'asked' }]
		})
		this.save()
		return waitingNotice(name, next)
	}

	finish(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		for (const thread of outcome.threads) thread.resolved = true
		outcome.status = 'complete'
		this.save()
		return `${outcome.title} is done.`
	}

	pause(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		outcome.status = 'cancelled'
		this.save()
		return `${outcome.title} is set aside.`
	}

	resume(outcomeId: string): string {
		const outcome = this.outcome(outcomeId)
		outcome.status = 'open'
		this.save()
		const open = openThreads(outcome)
		if (open.length === 0) return `${outcome.title} is back. Name who has it next.`
		const soonest = open[0]
		if (Date.parse(soonest.nextNudgeAt) <= endOfToday()) return `${outcome.title} is back on today.`
		return `${outcome.title} is back. You'll nudge ${soonest.person} on ${formatDay(new Date(soonest.nextNudgeAt))}.`
	}

	add(title: string, person: string, ask: string): string {
		if (this.sample) {
			this.outcomes = []
			this.sample = false
		}
		const name = person.trim()
		const next = shift('today')
		this.outcomes.push({
			id: uid(),
			title: title.trim(),
			status: 'open',
			threads: [
				{
					id: uid(),
					person: name,
					ask: ask.trim(),
					nextNudgeAt: next.toISOString(),
					resolved: false,
					touches: [{ id: uid(), at: new Date().toISOString(), kind: 'asked' }]
				}
			]
		})
		this.save()
		return waitingNotice(name, next)
	}

	applyBackup(outcomes: Outcome[], sample: boolean): string {
		this.outcomes = outcomes
		this.sample = sample
		this.save()
		const count = outcomes.length === 1 ? '1 outcome' : `${outcomes.length} outcomes`
		return `Restored ${count}.`
	}

	clearSample(): void {
		if (!this.sample) return
		this.outcomes = []
		this.sample = false
		this.save()
	}

	private replyOnOpenThreads(outcome: Outcome): void {
		for (const thread of outcome.threads) {
			if (thread.resolved) continue
			thread.touches.push({ id: uid(), at: new Date().toISOString(), kind: 'replied' })
			thread.resolved = true
		}
	}

	private outcome(id: string): Outcome {
		const outcome = this.outcomes.find((item) => item.id === id)
		if (!outcome) throw new Error(`Missing outcome ${id}`)
		return outcome
	}

	private thread(outcomeId: string, threadId: string): Thread {
		const thread = this.outcome(outcomeId).threads.find((item) => item.id === threadId)
		if (!thread) throw new Error(`Missing thread ${threadId}`)
		return thread
	}

	private restore(): void {
		const raw = localStorage.getItem(KEY)
		if (!raw) {
			this.outcomes = sampleOutcomes()
			this.sample = true
			this.save()
			return
		}
		try {
			const parsed = JSON.parse(raw) as Persisted
			this.outcomes = parsed.outcomes ?? []
			this.sample = Boolean(parsed.sample)
		} catch {
			this.outcomes = sampleOutcomes()
			this.sample = true
			this.save()
		}
	}

	private save(): void {
		if (typeof localStorage === 'undefined') return
		const payload: Persisted = { sample: this.sample, outcomes: this.outcomes }
		localStorage.setItem(KEY, JSON.stringify(payload))
	}
}

export const today = new Queue()
