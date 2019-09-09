function Queue(){

  let queue  = [];
  let offset = 0;

  this.getLength = function() {
    return (queue.length - offset);
  }

  this.isEmpty = function() {
    return (queue.length == 0);
  }

  this.enqueue = function(item) {
    queue.push(item);
  }

  this.dequeue = function(){

    if (queue.length == 0) return;

    var item = queue[offset];

    offset++;
    if (offset * 2 >= queue.length) {
      queue  = queue.slice(offset);
      offset = 0;
    }

    return item;
  }

  this.peek = function(){
    if (queue.length == 0) return;
    return queue[offset];
  }
}

module.exports = Queue;