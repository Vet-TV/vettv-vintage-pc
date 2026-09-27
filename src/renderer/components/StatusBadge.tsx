import type { MachineStatus } from '@shared/types'

const CLASS: Record<MachineStatus, string> = {
  Ready: 'badge badge-ready',
  'Needs ISO': 'badge badge-iso',
  'Needs ROMs': 'badge badge-roms'
}

const LABEL: Record<MachineStatus, string> = {
  Ready: 'Ready to start',
  'Needs ISO': 'Needs your OS ISO',
  'Needs ROMs': 'Needs BIOS files'
}

export default function StatusBadge({ status }: { status: MachineStatus }) {
  return <span className={CLASS[status]}>{LABEL[status]}</span>
}
