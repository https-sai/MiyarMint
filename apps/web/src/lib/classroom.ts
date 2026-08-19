const keyFor = (userId: string) => `myrmint:active-classroom:${userId}`

export function readActiveClassroomId(userId: string): string | null {
  return localStorage.getItem(keyFor(userId))
}

export function writeActiveClassroomId(userId: string, classroomId: string | null) {
  if (!classroomId) {
    localStorage.removeItem(keyFor(userId))
    return
  }
  localStorage.setItem(keyFor(userId), classroomId)
}
