(function(){
  //------------------------------
  // Mesh Properties
  //------------------------------
  var MESH = {
    width: 1.2,
    height: 1.2,
    slices: 250,
    ambient: '#555555',
    diffuse: '#FFFFFF'
  };

  //------------------------------
  // Light Properties
  //------------------------------
  var LIGHT = {
    count: 1,
    xPos : -670,
    yPos : 304,
    zOffset: 80,
    ambient: '#000000',
    diffuse: '#FF8800',
    pickedup :true,
    proxy : false,
    currIndex : 0
  };

  //------------------------------
  // Render Properties
  //------------------------------
  var WEBGL = 'webgl';
  var CANVAS = 'canvas';
  var SVG = 'svg';
  var RENDER = {
    renderer: WEBGL
  };

  //------------------------------
  // Export Properties
  //------------------------------
  var EXPORT = {
    width: 2000,
    height: 1000,

    exportCurrent: function(){
      switch(RENDER.renderer) {
        case WEBGL:
          window.open(webglRenderer.element.toDataURL(), '_blank');
          break;
        case CANVAS:
          window.open(canvasRenderer.element.toDataURL(), '_blank');
          break;
        case SVG:
          var data = encodeURIComponent(output.innerHTML);
          var url = "data:image/svg+xml," + data;
          window.open(url, '_blank');
          break;
      }
    },
    export: function() {
      var l, x, y, light,
        scalarX = this.width / renderer.width,
        scalarY = this.height / renderer.height;

      // store a temp value of the slices
      var slices = MESH.slices;
      // Increase or decrease number of slices depending on the size of the canvas
      MESH.slices = Math.ceil(slices*scalarX*1.3);

      // Regenerate the whole canvas
      resize(this.width, this.height);

      // restore the number of slices
      MESH.slices = slices;

      // Move the lights on the plane to accomodate the size of the canvas
      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l];
        x = light.position[0];
        y = light.position[1];
        z = light.position[2];
        FSS.Vector3.set(light.position, x*scalarX, y*scalarY, z*scalarX);
      }

      // Render the canvas
      render();

      switch(RENDER.renderer) {
        case WEBGL:
          window.open(webglRenderer.element.toDataURL(), '_blank');
          break;
        case CANVAS:
          window.open(canvasRenderer.element.toDataURL(), '_blank');
          break;
        case SVG:
          var data = encodeURIComponent(output.innerHTML);
          var url = "data:image/svg+xml," + data;
          window.open(url, '_blank');
          break;
      }

      resize(container.offsetWidth, container.offsetHeight);

      for (l = scene.lights.length - 1; l >= 0; l--) {
        light = scene.lights[l];
        x = light.position[0];
        y = light.position[1];
        z = light.position[2];
        FSS.Vector3.set(light.position, x/scalarX, y/scalarY, z/scalarX);
      }
    }
  };


  //------------------------------
  // Global Properties
  //------------------------------
  var center = FSS.Vector3.create();
  var container = document.getElementById('aragorn-background');
  var controls = document.getElementById('aragorn-background-controls');
  var output = document.getElementById('aragorn-background-output');
  var renderer, scene, mesh, geometry, material;
  var webglRenderer, canvasRenderer, svgRenderer;
  var gui;

  //------------------------------
  // Methods
  //------------------------------
  function initialise() {
    createRenderer();
    createScene();
    createMesh();
    addLight();
    movefirst();
    addControls();
    resize(container.offsetWidth, container.offsetHeight);
    animate();
  }

  function createRenderer() {
    webglRenderer = new FSS.WebGLRenderer();
    canvasRenderer = new FSS.CanvasRenderer();
    svgRenderer = new FSS.SVGRenderer();
    setRenderer(RENDER.renderer);
  }

  function setRenderer(index) {
    if (renderer) {
      output.removeChild(renderer.element);
    }
    switch(index) {
      case WEBGL:
        renderer = webglRenderer;
        break;
      case CANVAS:
        renderer = canvasRenderer;
        break;
      case SVG:
        renderer = svgRenderer;
        break;
    }
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    output.appendChild(renderer.element);
  }

  function createScene() {
    scene = new FSS.Scene();
  }

  function createMesh() {
    scene.remove(mesh);
    renderer.clear();
    geometry = new FSS.Plane(MESH.width * renderer.width, MESH.height * renderer.height, MESH.slices);
    material = new FSS.Material(MESH.ambient, MESH.diffuse);
    mesh = new FSS.Mesh(geometry, material);
    scene.add(mesh);
  }

  // Add a single light
  function addLight() {
    renderer.clear();
    light = new FSS.Light(LIGHT.ambient, LIGHT.diffuse);
    light.ambientHex = light.ambient.format();
    light.diffuseHex = light.diffuse.format();
    light.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.zOffset);
    scene.add(light);
    LIGHT.proxy = light;
    LIGHT.pickedup = true;
    LIGHT.currIndex++;
  }

  // Remove lights 
  function trimLights(value) {
    LIGHT.proxy = scene.lights[value - 1];
    var n = scene.lights.length - 1;
    for (l = value; l >= n; l--) {
      light = scene.lights[l];
      scene.remove(light);
    }
    renderer.clear();
  }

  // Resize canvas
  function resize(width, height) {
    renderer.setSize(width, height);
    FSS.Vector3.set(center, renderer.halfWidth, renderer.halfHeight);
    createMesh();
  }
  
  function movefirst() {
    var getArray = function(start, end) {
      var ret = [];
      var startPoint = [start[0] * renderer.width - renderer.width/2, renderer.height/2 - start[1] * renderer.height];
      var endPoint = [end[0] * renderer.width - renderer.width/2, renderer.height/2 - end[1] * renderer.height];
      for (var i = 1, n = 30; i <= n; i++) {
        ret.push([(i * startPoint[0] + (n - i) * endPoint[0]) / n, (i * startPoint[1] + (n - i) * endPoint[1]) / n])
      }
      return ret;
    }
    var movearray = getArray([0.4, 1], [0, 0]).concat(getArray([0.8, 0.2], [0.4, 1])).concat(getArray([0.5, 0.5], [0.8, 0.2]))
    if(LIGHT.pickedup) {
        movearray.forEach(
            function(item, index) {
              setTimeout(
                function() {
                  LIGHT.xPos = item[0]
                  LIGHT.yPos = item[1]
                  LIGHT.proxy.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.proxy.position[2])
                }, index * 70
              )
            }
        )
    }
    var inter;
    setTimeout(function() {inter = setInterval(function() {
        var value = LIGHT.proxy.position[2] + 3;
        LIGHT.proxy.setPosition(LIGHT.proxy.position[0], LIGHT.proxy.position[1], value);
        LIGNT.zOffset = value;
      }, 100)}, movearray.length * 70 - 70)
    setTimeout(function() {clearInterval(inter);}, movearray.length * 70 + 1700)
    setTimeout(function() {
      document.getElementById('title').style.display = 'block';
    }, movearray.length * 70 + 500)
    setTimeout(function() {
      document.getElementById('subtitle').style.display = 'block';
      document.getElementById('nav').style.display = 'block';
      document.getElementById('bottomarrow').style.display = 'block';      
      addEventListeners();
    }, movearray.length * 70 + 2000)
  }

  function animate() {
    render();
    requestAnimationFrame(animate);
  }

  function render() {
    renderer.render(scene);
  }

  function addEventListeners() {
    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousemove', onMouseMove);
  }

  function addControls() {
    var i, l, light, folder, controller;

    // Create GUI
    gui = new dat.GUI({autoPlace:false});

    controls.appendChild(gui.domElement);

    // Create folders
    renderFolder = gui.addFolder('Render');
    meshFolder = gui.addFolder('Mesh');
    lightFolder = gui.addFolder('Light');
    exportFolder = gui.addFolder('Export');

    // Open folders
    lightFolder.open();

    // Add Render Controls
    controller = renderFolder.add(RENDER, 'renderer', {webgl:WEBGL, canvas:CANVAS, svg:SVG});
    controller.onChange(function(value) {
      setRenderer(value);
    });

    // Add Mesh Controls
    controller = meshFolder.addColor(MESH, 'ambient');
    controller.onChange(function(value) {
      for (i = 0, l = scene.meshes.length; i < l; i++) {
        scene.meshes[i].material.ambient.set(value);
      }
    });
    controller = meshFolder.addColor(MESH, 'diffuse');
    controller.onChange(function(value) {
      for (i = 0, l = scene.meshes.length; i < l; i++) {
        scene.meshes[i].material.diffuse.set(value);
      }
    });
    controller = meshFolder.add(MESH, 'width', 0.05, 2);
    controller.onChange(function(value) {
      if (geometry.width !== value * renderer.width) { createMesh(); }
    });
    controller = meshFolder.add(MESH, 'height', 0.05, 2);
    controller.onChange(function(value) {
      if (geometry.height !== value * renderer.height) { createMesh(); }
    });
    controller = meshFolder.add(MESH, 'slices', 1, 800);
    controller.step(1);
    controller.onChange(function(value) {
      if (geometry.slices !== value) { createMesh(); }
    });

    // Add Light Controls
    // TODO: add the number of lights dynamically
    controller = lightFolder.add(LIGHT, 'currIndex', {1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7}).name('Current light').listen();
    controller.onChange(function(value) {
      LIGHT.proxy = scene.lights[value-1];
      LIGHT.ambient = LIGHT.proxy.ambient.hex;
      LIGHT.diffuse = LIGHT.proxy.diffuse.hex;
      LIGHT.xPos =  LIGHT.proxy.position[0];
      LIGHT.yPos =  LIGHT.proxy.position[1];
      LIGHT.zOffset =  LIGHT.proxy.position[2];
    });

    controller = lightFolder.addColor(LIGHT, 'ambient').listen();
    controller.onChange(function(value) {
      LIGHT.proxy.ambient.set(value);
      LIGHT.proxy.ambientHex =  LIGHT.proxy.ambient.format();
    });

    controller = lightFolder.addColor(LIGHT, 'diffuse').listen();
    controller.onChange(function(value) {
      LIGHT.proxy.diffuse.set(value);
      LIGHT.proxy.diffuseHex = LIGHT.proxy.ambient.format();
    });

    controller = lightFolder.add(LIGHT, 'count', 1, 7).listen();
    controller.step(1);
    controller.onChange(function(value) {
      if (scene.lights.length !== value) { 
        // If the value is more then the number of lights, add lights, otherwise delete lights
        if (value > scene.lights.length) {
          addLight(); 
        } else {
          trimLights(value);
        }
      }
    });

    controller = lightFolder.add(LIGHT, 'xPos', -mesh.geometry.width/2, mesh.geometry.width/2).listen();
    controller.step(1);
    controller.onChange(function(value) {
      LIGHT.proxy.setPosition(value, LIGHT.proxy.position[1], LIGHT.proxy.position[2]);
    });

    controller = lightFolder.add(LIGHT, 'yPos', -mesh.geometry.height/2, mesh.geometry.height/2).listen();
    controller.step(1);
    controller.onChange(function(value) {
      LIGHT.proxy.setPosition(LIGHT.proxy.position[0], value, LIGHT.proxy.position[2]);
    });

    controller = lightFolder.add(LIGHT, 'zOffset', 0, 1000).name('Distance').listen();
    controller.step(1);
    controller.onChange(function(value) {
      LIGHT.proxy.setPosition(LIGHT.proxy.position[0], LIGHT.proxy.position[1], value);
    });

    // Add Export Controls
    controller = exportFolder.add(EXPORT, 'width', 100, 3000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'height', 100, 3000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'export').name('export big');
    controller = exportFolder.add(EXPORT, 'exportCurrent').name('export this');

  }

  function toggleEl(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
  }


  //------------------------------
  // Callbacks
  //-----------------------------

  function onWindowResize(event) {
    resize(container.offsetWidth, container.offsetHeight);
    render();
  }

  function onMouseMove(event) {
    if(LIGHT.pickedup){
      LIGHT.xPos = event.x - renderer.width/2;
      LIGHT.yPos = renderer.height/2 -event.y;
      LIGHT.proxy.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.proxy.position[2]);
    } 
  }

  // Hide the controls completely on pressing 1
  Mousetrap.bind('ctrl+backspace', function() {
    toggleEl('aragorn-background-controls')
  });

  // Add a light on ENTER key
  Mousetrap.bind('shift+enter', function() { 
    LIGHT.count++;
    addLight(); 
  });
  Mousetrap.bind('shift+backspace', function() {
    var value = LIGHT.count - 1;
    if (scene.lights.length !== value && value > 0) {
      LIGHT.count = value;
      trimLights(value);
    }
  });
  // Pick up the light when a space is pressed
  Mousetrap.bind('shift+s', function() { 
    LIGHT.pickedup = !LIGHT.pickedup;
  });

  // Let there be light!
  initialise();

})();