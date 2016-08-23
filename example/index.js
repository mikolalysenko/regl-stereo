const regl = require('regl')({
  pixelRatio: 1
})
const normals = require('angle-normals')
const bunny = require('bunny')
const mat4 = require('gl-mat4')
const stereo = require('../stereo')({regl})

const drawMesh = regl({
  vert: `
  precision highp float;

  attribute vec3 position, normals;
  uniform mat4 projection, view, model;

  varying vec3 fragColor;

  void main () {
    vec3 color = normals;
    float minC = min(min(color.x, color.y), color.z);
    float maxC = max(max(color.x, color.y), color.z);
    fragColor = (color - minC) / (maxC - minC);
    gl_Position = projection * view * model * vec4(position, 1);
  }
  `,

  frag: `
  precision highp float;

  varying vec3 fragColor;

  void main () {
    gl_FragColor = vec4(fragColor, 1);
  }
  `,

  attributes: {
    position: bunny.positions,
    normals: normals(bunny.cells, bunny.positions)
  },

  elements: bunny.cells,

  uniforms: {
    model: ({tick}) =>
      mat4.rotateY(
        mat4.create(),
        mat4.identity(mat4.create()),
        0.01 * tick),
    view: ({tick}) =>
      mat4.lookAt(
        mat4.create(),
        [0, 2.5, -(20.0 + 10.0 * Math.cos(0.01 * tick))],
        [0, 2.5, 0],
        [0, 1, 0])
  }
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  stereo({
    zNear: 0.25,
    zFar: 1000.0,
    separation: 0.5
  }, () => {
    drawMesh()
  })
})
