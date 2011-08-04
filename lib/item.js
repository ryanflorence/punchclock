define(['lib/utils/number'], function (number){

/**
 * Item constructor
 * data object
 *  { name: string, lastUpdated: Date.now() }
*/
var Item = window.Item = function (data){
  this.init.apply(this, arguments);
};

/**
 * Stores all item instances as id: instance pairs
*/
Item.instances = {};

/**
 * Stores running instances
*/
Item.runningInstances = {};


/**
 * Stores all the data representations of an item for localStorage
*/
Item.data = {};

/**
 * Stores all the items to localStorage
*/
Item.store = function (){
  localStorage.setItem('clock-items', JSON.stringify(Item.data));
};

/**
 * Returns a (hopefully) unique ID
*/
Item.guid = function () {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1) +
          (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

/**
 * Initializes all items from localStorage
*/
Item.init = function (nodes){
  var toSort = [],
      data = JSON.parse(localStorage.getItem('clock-items') || '{}'),
      compare = function (a, b){ return a.lastUpdated - b.lastUpdated; },
      sorted,
      i,
      l;
      

  Item.nodes = nodes;

  for (i in data)
    toSort.push(data[i]);

  sorted = toSort.sort(compare);

  for (i = 0, l = sorted.length; i < l; i++)
    new Item(sorted[i]);

  Item.nodes.form.addEventListener('submit', function (event){
    event.preventDefault();
    var item = new Item({
      name: Item.nodes.input.value,
      id: 'item-' + Item.guid(),
      lastUpdated: Date.now(),
      time: 0,
      running: false
    });
    item.start();
    Item.nodes.input.value = '';
  }, false);

  Item.updateItems();
};

Item.updateItems = function (){
  for (var i in Item.runningInstances){
    Item.runningInstances[i].setInputValue();
  };
  setTimeout(Item.updateItems, 1000);
}

/**
 * The Item contructor prototype methods
*/
Item.prototype = {

  /**
   * Initializes a new item, called automotatically in the constructor
  */
  init: function (data){
    this.data = data;
    Item.instances[data.id] = this;
    Item.data[data.id] = data;
    this.render();
    if (this.data.runningSince) this.start(true);
    Item.store();
  },

  toggle: function (){
    this[this.data.runningSince ? 'stop' : 'start']();
  },

  /**
   * Starts the timer
  */
  start: function (hasSinceData){
    var that = this;
    if (!hasSinceData) this.data.runningSince = Date.now();
    Item.runningInstances[this.data.id] = this;
    this.element.className = 'on';
    Item.store();
  },

  /**
   * stops the timer
  */
  stop: function (){
    var now = Date.now();
    this.data.time += now - this.data.runningSince;
    this.data.runningSince = false;
    this.data.lastUpdated = now;
    this.element.className = '';
    delete Item.runningInstances[this.data.id];
    Item.store();
  },

  /**
   * Resets the time on an item
  */
  reset: function (){
    var that = this,
        className = this.element.className;
    this.data.time = 0;
    if (this.data.runningSince) this.data.runningSince = Date.now();
    this.setInputValue();
    this.element.className += ' reset';
    setTimeout(function (){
      that.element.className = className;
    }, 250);
  },

  /**
   * Sets the display of the input
  */
  setInputValue: function (){
    var now = Date.now(),
        time = (now - (this.data.runningSince || now)) + this.data.time,
        seconds = time / 1000,
        minutes = seconds / 60,
        hours = minutes / 60,
        padded = number.padRight(number.round(hours, 2), 2);
    this.input.value = padded;
  },

  /**
   * renders the item on the page and assignes this.element
  */
  render: function (){
    var that = this,
        li = this.element = document.createElement('li'),
        input = this.input = document.createElement('input'),
        del = document.createElement('button'),
        reset = document.createElement('button'),
        actions = document.createElement('span'),
        click = 'touchstart' in window ? 'touchstart' : 'click';

    //input.addEventListener('change', function (){
      //that.data.time = parseInt(input.value, 10);
    //}, false);

    del.innerHTML = 'delete';
    del.className = 'delete';
    del.addEventListener(click, function (event){
      if (confirm('Do you really want to delete ' + that.data.name + '?')){
        that.remove();
      }
    }, false);

    reset.innerHTML = 'reset';
    reset.className = 'reset';
    reset.addEventListener(click, function (event){
      that.reset();
    }, false);

    li.addEventListener(click, function (event){
      if (event.target !== li) return;
      that.toggle();
    }, false);

    li.setAttribute('id', this.data.id);
    li.innerHTML = this.data.name + ' <span class=indicator></span>';
    li.appendChild(input);
    li.appendChild(del);
    li.appendChild(reset);

    this.setInputValue();
    Item.nodes.list.insertBefore(li, Item.nodes.list.firstChild);
  },

  /**
   * Removes the item from the page and data
  */
  remove: function (){
    delete Item.instances[this.data.id];
    delete Item.data[this.data.id];
    delete Item.runningInstances[this.data.id];
    Item.store();
    Item.nodes.list.removeChild(this.element);
  }
};

return Item;

});
