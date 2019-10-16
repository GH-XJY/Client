function loader(source) {
  const resourcePath = this.resource

  let pos = 0
  let templateStartIndex = source.indexOf('<template>')
  let templateEndIndex = source.indexOf('</template>')

  function findNextElemPos() {
    let inComment = false
    let inElement = false
    while (pos < templateEndIndex) {
      if (inComment) {
        if (source.charAt(pos) === '-' && source.charAt(pos + 1) === '-' && source.charAt(pos + 2) === '>') {
          inComment = false
          pos += 3
        } else {
          pos++
        }
        continue
      } else if (inElement) {
        if (source.charAt(pos) === '>' || source.charAt(pos) === ' ') {
          return pos
        }
        pos++
        continue
      }
      if (source.charAt(pos) === '<') {
        if (source.charAt(pos + 1) === '!' && source.charAt(pos + 2) === '-' && source.charAt(pos + 3) === '-') {
          pos += 3
          inComment = true
        } else if (source.charAt(pos + 1).match(/\w/)) {
          inElement = true
        }
      }
      pos++
    }
    return -1
  }

  if (templateStartIndex !== -1 && templateEndIndex > templateStartIndex) {
    pos = templateStartIndex = templateStartIndex + '<template>'.length
    pos = findNextElemPos()
    if (pos !== -1) {
      return source.substring(0, pos) + ' data-source="' + resourcePath.substring(resourcePath.indexOf('src'), resourcePath.indexOf('.vue') + 4) + '" data-is-redevelopment' + source.substring(pos)
    }
  }
  return source
}
module.exports = loader
