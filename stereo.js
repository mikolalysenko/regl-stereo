const perspective = require('gl-mat4/perspective')
const translate = require('gl-mat4/translate')

module.exports = function ({regl}) {
  const mat = new Float32Array(16)
  const setEye = regl({
    context: {
      projection: ({viewportWidth, viewportHeight}, {eye, separation, fov, zNear, zFar}) => {
        perspective(
          mat,
          fov,
          0.5 * viewportWidth / viewportHeight,
          zNear,
          zFar)
        translate(mat, mat, [eye ? separation : -separation, 0, 0])
        return mat
      }
    },

    viewport: ({drawingBufferWidth, drawingBufferHeight}, {eye}) => {
      return {
        x: eye * drawingBufferWidth / 2,
        y: 0,
        width: drawingBufferWidth / 2,
        height: drawingBufferHeight
      }
    },

    scissor: {
      enable: true,
      box: ({drawingBufferWidth, drawingBufferHeight}, {eye}) => {
        return {
          x: eye * drawingBufferWidth / 2,
          y: 0,
          width: drawingBufferWidth / 2,
          height: drawingBufferHeight
        }
      }
    },

    uniforms: {
      projection: regl.context('projection')
    }
  })

  return function (props, block) {
    const zNear = props.zNear || 1
    const zFar = props.zFar || 1000.0
    const separation = props.separation || 0.25
    const fov = props.fov || (Math.PI / 4.0)
    setEye({
      eye: 0,
      fov,
      zNear,
      zFar,
      separation
    }, block)
    setEye({
      eye: 1,
      fov,
      zNear,
      zFar,
      separation
    }, block)
  }
}
