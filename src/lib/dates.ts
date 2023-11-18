function toNormalDate(date: Date): string {
  return JSON.stringify(new Date(date.setHours(date.getHours() + 3)))
      .replaceAll('"', '')
      .replace(/(.*)T.+Z/gm, "$1")
}

function toNormalDateAndTime(date: Date): string {
  return JSON.stringify(new Date(date.setHours(date.getHours() + 3)))
      .replaceAll('"', '')
      .replace(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/gm, "$1_$2-$3-$4")
}

function toNormalTime(date: Date): string {
  return JSON.stringify(new Date(date.setHours(date.getHours() + 3)))
      .replaceAll('"', '')
      .replace(/.*T(.+)Z/gm, "$1")
}

function slaToTime(date: string): string {
  const minutes = Math.floor((Date.parse(date) - Date.now()) / (1000 * 60))
  
  return (minutes > 60)
    ? `${Math.floor(minutes / 60)} ч ${Math.floor(minutes % 60)} мин`
    : `${minutes} мин`
} 

export {
  toNormalDate,
  toNormalDateAndTime,
  toNormalTime,
  slaToTime,
}