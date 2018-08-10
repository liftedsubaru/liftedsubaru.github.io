// adapted from Murri demo
document.addEventListener('DOMContentLoaded', function() {
  var grid = null;
  var docElem = document.documentElement;
  var mGrid = document.querySelector('.grid-mGrid');
  var gridElement = mGrid.querySelector('.grid');
  var filterField = mGrid.querySelector('.filter-field');
  var searchField = mGrid.querySelector('.search-field');
  var sortField = mGrid.querySelector('.sort-field');

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
    [ filterField].forEach(function(field) {
      field.value = field.querySelectorAll('option')[0].value;
    });

    // Set inital search query, active filter, active sort value and active layout.
    searchFieldValue = searchField.value.toLowerCase();
    filterFieldValue = filterField.value;

    // Search field binding.
    searchField.addEventListener('keyup', function() {
      var newSearch = searchField.value.toLowerCase();
      if (searchFieldValue !== newSearch) {
        searchFieldValue = newSearch;
        filter();
      }
    });

    // Filter, sort and layout bindings.
    filterField.addEventListener('change', filter);
  }

  function initGrid() {
    var dragCounter = 0;
    grid = new Muuri(gridElement, {
        items: document.getElementsByClassName('item'),
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
          return isDraggable ? Muuri.ItemDrag.defaultStartPredicate(item, event) : false;
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
      if (!isSearchMatch) isSearchMatch = (element.getAttribute('data-category') || '').toLowerCase().indexOf(searchFieldValue) > -1;

      var isFilterMatch = !filterFieldValue ? true : (element.getAttribute('data-category') || '').toLowerCase() === filterFieldValue.toLowerCase();
      return isSearchMatch && isFilterMatch;
    });
    if (getCount() === 0) {
      document.getElementById('noResults').innerHTML = `NO RESULTS FOLKS!`
    }
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

  // Generic helper functions
  function compareItemTitle(a, b) {
    var aVal = a.getElement().getAttribute('data-title') || '';
    var bVal = b.getElement().getAttribute('data-title') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

  }

  function compareItemCategory(a, b) {
    var aVal = a.getElement().getAttribute('data-category') || '';
    var bVal = b.getElement().getAttribute('data-category') || '';
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
});
