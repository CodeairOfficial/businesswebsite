import { Recording } from 'types'
import RecordingSnack from '../Snack'

interface RecordingSnackListProps {
  recordings: Recording[]
  currentRecordingIndex: number | null
  onRecordingClick: (recordingIndex: number) => void
}

export default function RecordingSnackList({
  recordings,
  onRecordingClick,
  currentRecordingIndex,
}: RecordingSnackListProps) {
  if (recordings.length === 0) {
    return null
  }
  return (
    <div className="recording__snack-list">
      <div className="recording__snack-list__title">Recordings</div>
      <div className="recording__snacks">
        {recordings.map((recording, idx) => {
          return (
            <RecordingSnack
              key={recording.recordingUrl}
              name={recording.name}
              index={idx}
              onRecordingClick={onRecordingClick}
              isActive={idx === currentRecordingIndex}
            />
          )
        })}
      </div>
    </div>
  )
}
