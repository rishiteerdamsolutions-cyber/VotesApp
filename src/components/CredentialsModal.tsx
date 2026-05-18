import { Button } from './ui/Button'

export function CredentialsModal({
  username,
  password,
  onClose,
}: {
  username: string
  password: string
  onClose: () => void
}) {
  const copy = () => {
    void navigator.clipboard.writeText(`Username: ${username}\nPassword: ${password}`)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-lg font-bold text-primary mb-4">Representative credentials</h2>
        <p className="text-sm text-gray-600 mb-2">Share with the rep (shown once):</p>
        <div className="bg-primary-xlight rounded-lg p-4 space-y-2 font-mono text-sm">
          <p>
            <span className="text-gray-500">Username:</span> {username}
          </p>
          <p>
            <span className="text-gray-500">Password:</span> {password}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Rep installs PWA, logs in with these credentials. Account binds to their phone only.
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" fullWidth onClick={copy}>
            Copy
          </Button>
          <Button fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
