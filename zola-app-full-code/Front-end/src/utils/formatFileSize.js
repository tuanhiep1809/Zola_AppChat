function changeFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  size /= 1024;
  if (size < 1024) {
    return `${size.toFixed(2)} KB`;
  }
  size /= 1024;
  if (size < 1024) {
    return `${size.toFixed(2)} MB`;
  }
  size /= 1024;
  if (size < 1024) {
    return `${size.toFixed(2)} GB`;
  }
  size /= 1024;
  return `${size.toFixed(2)} TB`;
}

export default changeFileSize;
