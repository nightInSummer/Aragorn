  (function() {
    var search = false;
    var menu = false;
    document.getElementById('aragorn-js-menu-button').onclick=function(){
      search && changeSearch(search)
      changeMenu(this);
    }
    document.getElementById('aragorn-js-search-button').onclick=function(){
      menu && changeMenu(menu)
      changeSearch(this);
    }
    var changeTop = function(value) {
      var topname = document.getElementsByClassName('aragorn-topname')[0]
      topname.style.visibility = 'inherit'
      topname.className = topname.className.indexOf('flipOutX') === -1 ? 'aragorn-topname flipOutX' : 'aragorn-topname flipOutY'
      var topnametext = document.getElementById('aragorn-topname')
      setTimeout(function(){topnametext.innerText = value}, 800)
    }
    var changeMenu = function(me) {
      me.className.indexOf('open') == -1 ? me.className+=' open' : me.className='aragorn-menu-button'
      var wrapper = document.getElementsByClassName('aragorn-menu-wrapper')[0]; wrapper.style.visibility = 'inherit'; 
      wrapper.className = wrapper.className.indexOf('visionIn') === -1 ? 'aragorn-menu-wrapper visionIn' : 'aragorn-menu-wrapper visionOut';
      menu = menu ? false : me
      menu ? changeTop('Menu') : changeTop('寻宝')
    }
    var changeSearch = function(me) {
      me.className.indexOf('close') == -1 ? me.className+=' close' : me.className='search';
      var input = document.getElementsByClassName('input')[0];
      input.className.indexOf('square') == -1 ? input.className='square ' + input.className : input.className='input';
      var wrapper = document.getElementsByClassName('aragorn-toolbar-wrapper')[0]; wrapper.style.visibility = 'inherit'; 
      wrapper.className = wrapper.className.indexOf('visionIn') === -1 ? 'aragorn-toolbar-wrapper visionIn' : 'aragorn-toolbar-wrapper visionOut';
      search = search ? false : me
      search ? changeTop('Search') : changeTop('寻宝')
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