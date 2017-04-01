  (function() {
    document.getElementById('aragorn-js-menu-button').onclick=function(){this.className.indexOf('open') == -1 ? this.className+=' open' : this.className='aragorn-menu-button'}
    document.getElementById('aragorn-js-search-button').onclick=function(){
      this.className.indexOf('close') == -1 ? this.className+=' close' : this.className='search';
      var input = document.getElementsByClassName('input')[0];
      input.className.indexOf('square') == -1 ? input.className='square ' + input.className : input.className='input';
      var wrapper = document.getElementsByClassName('aragorn-toolbar-wrapper')[0]; wrapper.style.visibility = 'inherit'; 
      wrapper.className = wrapper.className.indexOf('visionIn') === -1 ? 'aragorn-toolbar-wrapper visionIn' : 'aragorn-toolbar-wrapper visionOut';
      var topname = document.getElementById('aragorn-topname')
      topname.innerText = topname.innerText === 'Search' ? '寻宝' : 'Search'
    }
    var canvasDiv = document.getElementsByClassName('aragorn-background')[0]
    var options = {
      particleColor: '#888',
      interactive: true,
      background: '#000000',
      speed: 'low',
      density: 'medium'
    }
    var particleCanvas = new ParticleNetwork(canvasDiv, options);
  })()