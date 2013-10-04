/*
 *
 * A tiny context menu to help out
 *
 * The idea is to create a shared context menu for svg elements.
 * The context menu *doesn't* add handlers to open it.  The context menu
 * has to be manually triggered(showMenu).
 *
 * jQuery is req'd.
 */


function TinyContextMenu(el){
  //Check to make sure the element passed in is a ul
  if(el[0].tagName !== 'UL'){
    throw new Error('Context menus have to be <ul>s\'');
  }

  //Add handlers to each element
  el.find('li').on('click', this.selectHandler.bind(this));

  this.el = el;
  this.targetEl = null;
}


TinyContextMenu.prototype.showMenu = function(clickEvt, data){
  if(!clickEvt) return;

  this.el.css({
    left: clickEvt.pageX,
    top: clickEvt.pageY,
    display: 'block'
  });
  
  if(data){
    if(data.cssClass){ 
      this.extraClass = data.cssClass;
      this.el.addClass(data.cssClass);
    }
    if(data.target){
      this.targetEl = data.target;
    }
  }

  $(document).one('click', this.hideMenu.bind(this));
};

TinyContextMenu.prototype.hideMenu = function(){
  this.el.css('display', 'none');
  this.el.removeClass(this.extraClass);
  this.extraClass = null;
  this.targetEl = null;
};

TinyContextMenu.prototype.selectHandler = function(ev){
  this.targetEl.fireEvent($(ev.target).data('action'), ev);
  this.targetEl = null;
  this.hideMenu();
};
