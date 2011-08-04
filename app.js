require(['lib/item'], function(Item){

  Item.init({
    list: document.getElementById('items'),
    input: document.getElementById('name'),
    form: document.getElementById('newItemForm')
  });

  window.scrollTo(0, 1);

  Item.nodes.input.addEventListener('focus', function (){
    window.scrollTo(0, 1);
  });

});

