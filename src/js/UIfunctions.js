var subject = "Math"; /* Choices are Math, ELA-Literacy */
var gradeLevels = [];

// This function makes the accordion for the standards list work
$(function() {
  $(".category-headings").click(function() {
    $(this).toggleClass("active");
    $(this).next().toggle('fast');
    return false;
  }).next().hide();
});

// This function shows and hides the info box
function toggleInfo(obj) {
  var infoBox = $(obj).parent().parent('li').children('.infoBox');
  if($(obj).hasClass('info')) {
    $(document).find('.infoBox').css('display', 'none');
    $(document).find('.infoClose').addClass('info').removeClass('infoClose');
    $(infoBox[0]).css('display', 'block');
    $(obj).addClass('infoClose').removeClass('info');
  } else {
    $(infoBox[0]).css('display', 'none');
    $(obj).addClass('info').removeClass('infoClose');
  }
}

// This function loads and hides the resource box
function toggleResourceBox(obj) {
  var resourceBox = $(obj).parent('.infoBoxButtons').next('.resourceBox');
  if($(resourceBox).css('display') === 'none') {
    var standardName = $(obj).parentsUntil('ul','li').children('input').val();
    $(resourceBox).html('<div class="resourceHead">Resources</div><hr/>');
    if(typeof resources[standardName] === 'undefined') {
      $(resourceBox).append('There are no resources currently associated with this standard.<br/><br/>');
    }
    for(resIndex in resources[standardName]) {
      $(resourceBox).append('<a target="_blank" href="' + resources[standardName][resIndex]["url"] + '">' + resources[standardName][resIndex]["name"] + '</a><br/><br/>');
    }
    $(resourceBox).css('display','block');
  } else {
    $(resourceBox).css('display','none');
  }
}

// This function activates the clicked subject
function subjectButton(obj) {
  subject = $(obj).val();
  filter();
}

// This function adds the clicked grade to the array of selected grades
function gradeButton(obj) {
  if($(obj).hasClass("selected")) {
    $(obj).removeClass('selected');
    var index = gradeLevels.indexOf(obj.id);
    gradeLevels.splice(index, 1);
  } else {
    $(obj).addClass('selected');
    gradeLevels.push(obj.id);
  }
  filter();
}

// This function filters what shows in the Common Core and the Public standards
// The filter works with grades and subjects chosen as well as search filter input
function filter(input) {
  if(typeof input != 'undefined') {
    var inputArray = input.value.split(" ");
    var contains = "";
    inputArray.forEach(function(elem) {
      contains += ":contains('" + elem + "')";
    });
  }
  $('#commonCoreTree').find('li').hide();
  $('#publicWrapper').find('li').hide();
  var results;
  $('#commonCore').tree('collapseAll');
  gradeLevels.forEach(function(elem) {
    if(typeof input === 'undefined' || input.value === "") {
      $('#commonCoreTree').find('.' + elem + 'grade.' + subject).show();
    } else {
      $('.filtered').removeClass('filtered');
      results = $(results).add($('#commonCoreTree').find('.grade.' + elem + 'grade.' + subject).find(".infoBox" + contains).parent());
    }
  });
  if(typeof input === 'undefined' || input.value === "") {
    $(".filter").attr("id", "off");
    $('.filtered').removeClass('filtered');
    $('#publicWrapper').find('li').show();
    for(var i=0; i < publicCount; i++) {
      if($('ul.publicTree' + i).children('li').has('ul').length) {
        $('#public' + i).tree('collapse', $('.filtered').parentsUntil('#publicTree' + i, '.expanded'));
      }
    }
  } else {
    $(".filter").attr("id", "on");
    for(var i=0; i < publicCount; i++) {
      publicResults = $('#publicTree' + i).find(".infoBox" + contains).parent();
      $(publicResults).addClass('filtered');
      if($('ul.publicTree' + i).children('li').has('ul').length) {
        $('#public' + i).tree('expand', $(publicResults).parentsUntil('#publicTree' + i, '.collapsed'));
      }
      $(publicResults).show();
      $(publicResults).parentsUntil('#publicTree' + i).show();
    }
    $(results).addClass('filtered');
    $('#commonCore').tree('expand', $(results).parentsUntil('#commonCoreTree', '.collapsed'));
    $(results).show();
    $(results).parentsUntil('#commonCoreTree').show();
  }
}

function abbreviate(obj) {
  if($(obj).width() > 0 && $(obj).parent('li').width() > 0) {
    while($(obj).width() + 40 > $(obj).parent('li').width()) {
      var start = (($(obj).text().length + 1) / 2) - 2;
      if(start < 1) {
        break;
      }
      $(obj).text($(obj).text().slice(0, start) + ".." + $(obj).text().slice(start + 4));
    }
  }
}

function abbreviateChildren(obj) {
  var labels = $(obj).find('.label:visible');
  labels.each(function(label) {
    abbreviate(this);
  });
}

jQuery.expr[':'].contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(window).load(function() {

  // call the recursive load CCSS
  recursiveLoadCC();
  // call the resources load
  loadResources();
  // call the function to load the published framework titles
  loadFrameworkTitles();

  // We want to have a new framework and a new standard already created at page load
  addStandard();
  addStandard();

  // listen for submit event on searchForm to call filter function
  $("#searchForm").submit(function() {
    filter($("#filter-input").get(0));
    return false;
  });

  $("#filter-input").keyup(function() {
    delay(function() {
      filter($("#filter-input").get(0));
      var target = $('#commonCoreWrapper').prev();
      if($(target).hasClass('active')) {
      } else {
        $(target).trigger('click');
      }
    }, 300);
  });
  $("#filter-input").click(function() {
    delay(function() {
      filter($("#filter-input").get(0));
      var target = $('#commonCoreWrapper').prev();
      if($(target).hasClass('active')) {
      } else {
        $(target).trigger('click');
      }
    }, 300);
  });

  // listen for a change to the input where files are uploaded
  document.getElementById('files').addEventListener('change', readStandardsJSON, false);

  // listen for the user closing the window to make sure we're not still publishing
  window.onbeforeunload = function() {
    if(publishing > 0) {
      return 'This page is still publishing your framework. If you leave the page now, your published framework will be incomplete.';
    }
  };
});
