export function pasreFormData<T>(data: T): string {
  const str = new URLSearchParams(Object.entries(data)).toString();
  return str;
}
