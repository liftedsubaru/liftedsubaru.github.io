document.addEventListener('DOMContentLoaded', function() {

  var grid = null;
  var docElem = document.documentElement;
  var demo = document.querySelector('.grid-demo');
  var gridElement = demo.querySelector('.grid');
  var filterField = demo.querySelector('.filter-field');
  var searchField = demo.querySelector('.search-field');
  var sortField = demo.querySelector('.sort-field');
  var filterOptions = {
    EA81: 'grey',
    EA82: 'blue',
    EJ22: 'red',
    EJ25: 'yellow',
    EJ15: 'purple',
    generic: 'brown'
  }; // TODO this needs to be created by handlebars
  var dragOrder = [];
  var uuid = 0;
  var filterFieldValue;
  var sortFieldValue;
  var searchFieldValue;

  //
  // Grid helper functions
  //

  function initDemo() {
    initGrid();

    // Reset field values.
    searchField.value = '';
    [sortField, filterField].forEach(function(field) {
      field.value = field.querySelectorAll('option')[0].value;
    });

    // Set inital search query, active filter, active sort value and active layout.
    searchFieldValue = searchField.value.toLowerCase();
    filterFieldValue = filterField.value;
    sortFieldValue = sortField.value;

    // Search field binding.
    searchField.addEventListener('keyup', function() {
      var newSearch = searchField.value.toLowerCase();
      if (searchFieldValue !== newSearch) {
        searchFieldValue = newSearch;
        filter();
        if (getCount() === 0) {
          document.getElementById('noResults').innerHTML = `NO RESULTS FOLKS!`
        }
      }
    });

    // Filter, sort and layout bindings.
    filterField.addEventListener('change', filter);
    sortField.addEventListener('change', sort);
  }

  function initGrid() {
    var dragCounter = 0;
    grid = new Muuri(gridElement, {
        items: generateElements(36),
        layout: {
          horizontal: false,
          alignRight: false,
          alignBottom: false,
          fillGaps: true
        },
        layoutDuration: 400,
        layoutEasing: 'ease',
        dragEnabled: true,
        dragSortInterval: 50,
        dragContainer: document.body,
        dragStartPredicate: function(item, event) {
          var isDraggable = sortFieldValue === 'order';
          var isRemoveAction = elementMatches(event.target, '.card-remove, .card-remove i');
          return isDraggable && !isRemoveAction ? Muuri.ItemDrag.defaultStartPredicate(item, event) : false;
        },
        dragReleaseDuration: 400,
        dragReleseEasing: 'ease'
      })
      .on('dragStart', function() {
        ++dragCounter;
        docElem.classList.add('dragging');
      })
      .on('dragEnd', function() {
        if (--dragCounter < 1) {
          docElem.classList.remove('dragging');
        }
      })
      .on('move', updateIndices)
      .on('sort', updateIndices);
  }

  function filter() {
    filterFieldValue = filterField.value;
    grid.filter(function(item) {
      var element = item.getElement();
      var isSearchMatch = !searchFieldValue ? true : (element.getAttribute('data-title') || '').toLowerCase().indexOf(searchFieldValue) > -1;
      if (!isSearchMatch) isSearchMatch = (element.getAttribute('data-description') || '').toLowerCase().indexOf(searchFieldValue) > -1;
      if (!isSearchMatch) isSearchMatch = (element.getAttribute('data-color') || '').toLowerCase().indexOf(searchFieldValue) > -1;

      var isFilterMatch = !filterFieldValue ? true : (element.getAttribute('data-color') || '') === filterFieldValue;
      return isSearchMatch && isFilterMatch;
    });
    document.getElementById('resultCount').innerHTML = getCount() + " results";
  }

  function getCount() {
    var returnable = 0;
    grid._items.forEach(function(item) {
      if (item._isActive) {
        returnable += 1
      }
    })
    return returnable;
  }

  function sort() {
    // Do nothing if sort value did not change.
    var currentSort = sortField.value;
    if (sortFieldValue === currentSort) {
      return;
    }

    // If we are changing from "order" sorting to something else
    // let's store the drag order.
    if (sortFieldValue === 'order') {
      dragOrder = grid.getItems();
    }

    // Sort the items.
    grid.sort(
      currentSort === 'title' ? compareItemTitle :
      currentSort === 'category' ? compareItemColor :
      dragOrder
    );

    // Update indices and active sort value.
    updateIndices();
    sortFieldValue = currentSort;
  }

  // Generic helper functions
  function abbreviate(inputString, k) {
    /* @params string,
        @params int,
    */
    if (inputString.length > k) {
      var charactersAllowed = k - 3; // 3 for my dot dot dots
      return inputString.slice(0, charactersAllowed) + '...';
    }
    return inputString;
  }


  /*
    TODO: this could be where we read in configs for tiles.
    same configs for creating detail pages, height width need to be flexible for mobile
    HANDLEBARS
  */
  function generateElements(amount) {
    var tiles = [];
    for (var i = 0, len = amount || 1; i < amount; i++) {
      var id = ++uuid;
      var category = getRandomItem(Object.keys(filterOptions));
      var color = filterOptions[category];
      var title = abbreviate('0123456789012345678901234567', 28); // 21 chars max //generateRandomWord(6);
      var description = i + abbreviate('012345678901234567890123456789012345678901234567', 47); //30 chars
      var width = 4; // Math.floor(Math.random() * 2) + 1;
      var height = 2; // Math.floor(Math.random() * 2) + 1;
      var itemElem = document.createElement('div');

      var image= './static/img/site/placeholder.jpg' // 300x220
// width:100%;height:220px;background:#fff; opacity:.4;
      var itemTemplate = '' +
        '<div class="item h' + height + ' w' + width + ' ' + color + '" data-id="' + id + '" data-color="' + category + '" data-description="' + description + '" data-title="' + title + '">' +
        '<a href="#"> <div class="item-content">' +
        `<div class="card" style="background-image: url('${image}'); background-size: 300px;">` +
        `<div class="card-id">${category}</div>` +
        '<div class="card-title">' + title + '</div>' +
        '<div class="card-description">' + description + '</div>' +
        '</div>' +
        '</div></a>'+
        '</div>';

      itemElem.innerHTML = itemTemplate;
      tiles.push(itemElem.firstChild);
    }

    return tiles;
  }

  function getRandomItem(collection) {
    return collection[Math.floor(Math.random() * collection.length)];
  }

  function generateRandomWord(length) {
    var ret = '';
    for (var i = 0; i < length; i++) {
      ret += getRandomItem('abcdefghijklmnopqrstuvwxyz');
    }
    return ret;
  }

  function compareItemTitle(a, b) {
    var aVal = a.getElement().getAttribute('data-title') || '';
    var bVal = b.getElement().getAttribute('data-title') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

  }

  function compareItemColor(a, b) {
    var aVal = a.getElement().getAttribute('data-color') || '';
    var bVal = b.getElement().getAttribute('data-color') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : compareItemTitle(a, b);
  }

  function updateIndices() {
    grid.getItems().forEach(function(item, i) {
      item.getElement().setAttribute('data-id', i + 1);
      item.getElement().querySelector('.card-id').innerHTML = i + 1;
    });
  }

  function elementMatches(element, selector) {
    var p = Element.prototype;
    return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector).call(element, selector);
  }

  function elementClosest(element, selector) {
    if (window.Element && !Element.prototype.closest) {
      var isMatch = elementMatches(element, selector);
      while (!isMatch && element && element !== document) {
        element = element.parentNode;
        isMatch = element && element !== document && elementMatches(element, selector);
      }
      return element && element !== document ? element : null;
    } else {
      return element.closest(selector);
    }
  }

  // Fire it up!
  initDemo();
  document.getElementById('resultCount').innerHTML = getCount() + " results";
});
