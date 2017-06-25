'use strict';

var recordsOutput = document.getElementById('recordsOutput');
var records = JSON.parse(localStorage.getItem('records'));
var filter = JSON.parse(localStorage.getItem('filter'));			
var filteredRecs = [];

document.getElementById('noteSubmit').addEventListener('click', submitNotes);
document.getElementById('bookmarkSubmit').addEventListener('click', submitBookmarks);
document.getElementById('ideasSubmit').addEventListener('click', submitIdeas);


function backupJson () {
	var bckFile = new Blob([records], {type: "application/json"});	
	if (confirm("Backup all records in JSON format?") == true) {
		(saveAs(bckFile, "records_backup-all.json"));}
}

function backupFilteredJson () {
	var filteredRecords = JSON.stringify(filteredRecs);
	var bckFile = new Blob([filteredRecords], {type: "application/json"});	
	if (confirm("Backup filtered records in JSON format?") == true) {
		(saveAs(bckFile, "records_backup-filtered.json"));}
}

function validateRecord(title, body){
  if(!title || !body){
    alert('Please fill in the form');
    return false;
  }
  return true;
}

function validateBookmark(title, url){
  if(!title || !url){
    alert('Please fill in the form');
    return false;
  }

  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);

  if(!url.match(regex)){
    alert('Please use a valid URL');
    return false;
  }

  return true;
}

function editListener () {	
	var records = JSON.parse(localStorage.getItem('records'));
	var recordsEdit = document.getElementsByClassName('record-content')
	for (var i = 0; i < recordsEdit.length; i++) {
		recordsEdit[i].addEventListener('keydown', function() {

		var el = event.target;
		if (el.classList.contains('record-title')) {
			var selectedEdit = "name";
		} else if (el.classList.contains('record-body')) {
			var selectedEdit = "body";
		}

		var info = el.parentNode.getAttribute('id');
		var data = ""
		if (event.key == "Enter") {
			data = el.innerHTML;
			for (var i = 0; i < records.length; i++) {
				if (records[i].id == info) {					
					records[i][selectedEdit] = data;															
				}
			}
			event.preventDefault();				
			el.blur();
			localStorage.setItem('records', JSON.stringify(records));
			fetchRecords();
		} else if (event.key == 'Escape') {
			document.execCommand('undo');
			el.blur();
		}			
		})
	}
}

function deleteListener () {
	var records = JSON.parse(localStorage.getItem('records'));
	var deleteBtns = document.getElementsByClassName("delete-btn")
	for (var i = 0; i < deleteBtns.length; i++) {
		deleteBtns[i].addEventListener('click', function () {
			if (confirm("Delete record?") == true) {
			var recordId = this.parentNode.getAttribute('id');
			for (var i = 0; i < records.length; i++) {
				if (records[i].id == recordId) {
					records.splice(i, 1);
				}
			}
			localStorage.setItem('records', JSON.stringify(records));
			fetchRecords();
		}})
	}
}

function filterListener () {
	var filter = JSON.parse(localStorage.getItem('filter'));		
	var dataFilter = document.getElementsByClassName("data-filter");	
	for (var i = 0; i < dataFilter.length; i++) {
		dataFilter[i].addEventListener('click', function () {
			var value = this.getAttribute('value');
			var filterType = this.getAttribute('data-filter-type')			
			if (filter[0][filterType].indexOf(value) != -1) {
				for (var i = 0; i < filter[0][filterType].length; i++) {
					if(filter[0][filterType][i] == value) {
						filter[0][filterType].splice(i, 1);
						}
					}
			} else {
			filter[0][filterType].push(value);			
			}
			localStorage.setItem('filter', JSON.stringify(filter));
			fetchRecords();	
		})
	}	
}

function dateSortListener () {
	var filter = JSON.parse(localStorage.getItem('filter'));
	var dateFilter = document.getElementById('dateSort');
	dateFilter.addEventListener('click', function(){
		if(filter[0].date == "Descending"){
			filter[0].date = "Ascending";
			localStorage.setItem('filter', JSON.stringify(filter));
		} else {
			filter[0].date = "Descending";
			localStorage.setItem('filter', JSON.stringify(filter));
		}
		fetchRecords();
	})
}

function fetchRecords () {
	if (localStorage.getItem('filter') === null) {
		var filter = [{"tags":[],"category":[],"date":"Descending"}];
		localStorage.setItem('filter', JSON.stringify(filter));
	}
	if (localStorage.getItem('records') === null) {
		var records = [{
 	 "id": "test01",
	 "category": ["note"],
 	 "name": "Export to JSON",
 	 "body": "You can backup records in JSON format (all records or the ones currently filtered).",
	 "date": "2017-06-24T17:11:13.448Z",
 	 "tags": ["help", "json", "test"]
	}, {
	  "id": "test02",
	  "category": ["bookmark"],
	  "name": "&lt;-- URL. Google ",
	  "url": "https://www.google.com",
	  "date": "2017-06-24T17:07:38.322Z",
	  "tags": ["test"]
	}, {
	  "id": "test03",
	  "category": ["note"],
	  "name": "Filter by category and/or tags. Edit This Title",
	  "body": "All records are saved in localStorage of the browser. You can filter all records by categories (note, bookmark) and/or by tags. You can edit title and text.",
	  "date": "2017-06-24T16:56:59.356Z",
	  "tags": ["test", "help"]
	}];
		localStorage.setItem('records', JSON.stringify(records));		
	}

	var records = JSON.parse(localStorage.getItem('records'));
	var filter = JSON.parse(localStorage.getItem('filter'));			
	recordsOutput.innerHTML = "";
	if (filter[0].date == "Descending")	{
		records.sort(function(a,b){ return new Date(b.date) - new Date(a.date);	});
	} else { 
		records.sort(function(a,b){ return new Date(a.date) - new Date(b.date);	});
	}	
 
	var controlString 	="<div id='controlContainer'></button><a href='#' class='btn btn-default btn-sm' onclick='backupJson()''>Backup All</a>"
						+"<a href='#' class='btn btn-default btn-sm' onclick='backupFilteredJson()'>Backup Filtered</a>"
						+"<button id='dateSort' class='btn btn-sm btn-info'>Date: "+filter[0].date+"</div>"
	var typeString = "<div id='filteredCategoriesContainer'>";
	var typeStringHeader = "<div id='category-header'>";
	var possibleCategory = ["note", "bookmark", "idea"];	
	for (var i = 0; i < possibleCategory.length; i++) {
		if (filter[0].category[0] === undefined) {				
			typeStringHeader = "<div id='category-header'><h4 class='inline-headers'>All Records: <span class='small-text'>(select one or several categories to filter records)</span></h4>"
			typeString    += "<button data-filter-type='category' value='"+possibleCategory[i]+"' class='data-filter category btn btn-default btn-sm'>"+possibleCategory[i]+"s</button>"
		} else if (filter[0].category.some( function(el) {
			return possibleCategory[i].indexOf(el) >=0;
		}))	{ 	typeString    	+= "<button data-filter-type='category' value='"+possibleCategory[i]+"' class='data-filter category btn btn-default btn-sm active'>"+possibleCategory[i]+"s</button>"
				typeStringHeader	+= '<h4 class="inline-headers">' + possibleCategory[i].charAt(0).toUpperCase()+possibleCategory[i].slice(1) + 's, </h4>';
		} else {
			typeString    += "<button data-filter-type='category' value='"+possibleCategory[i]+"' class='data-filter category btn btn-default btn-sm'>"+possibleCategory[i]+"s</button>"
		}
	}
	typeStringHeader = typeStringHeader.slice(0, -7);
	typeStringHeader += ':</h4></div></div>'
	recordsOutput.innerHTML += typeStringHeader + controlString + typeString;

	//create div container displaying active tags
	if (filter[0].tags[0] === undefined) {
			var tagsString = "<div id='filteredTagsContainer'>";
		} else {
			var tagsString = "<div id='tags-header'><h4 class='inline-headers'>Filtered By Tags: </h4></div><div id='filteredTagsContainer'>";
		}
	
	for (var i = 0; i < filter[0].tags.length; i++) {
		tagsString 	+='<button data-filter-type="tags" value="'
					+filter[0].tags[i]+'" class="data-filter tags btn btn-info btn-xs active">'
					+filter[0].tags[i]+ '</button>';
	}
	tagsString += '</div>';
	recordsOutput.innerHTML += tagsString;	
		
	//create records
	filteredRecs = [];
	var recordString = "";
	for (var i = 0; i < records.length; i++) {
		var change = new Date(records[i].date);
		records[i].date = change;
		if (filter[0].category[0] === undefined) {
			var filterRecType = true;
		} else {
			var filterRecType = filter[0].category.some(function(element) {			
			return records[i].category.indexOf(element) >= 0;
			});			
		}						
		if (filterRecType) {								
			var filterRecTags = filter[0].tags.every(function(element) {
			return records[i].tags.indexOf(element) >= 0;
			});		
			if (filterRecTags) {
					filteredRecs.push(records[i]);
					var recordStringType = "";
					if (records[i].category == 'note' || records[i].category == 'idea') {
					recordStringType = '<h5 contenteditable="true" class="record-title record-content">'
					+records[i].name+'</h5><p type="text" contenteditable="true" class="record-body record-content">'+records[i].body+'</p>'
					} if (records[i].category == 'bookmark') {
					recordStringType = '<a class="bookmark-link btn btn-primary btn-xs" href="'
					+records[i].url+'">Link</a><h5 contenteditable="true" class="bookmark-title record-title record-content">'
					+records[i].name+'</h5>'}

					recordString += '<div id='+records[i].id+' class="record '+records[i].category+'">'
					+recordStringType
					+'<button data-filter-type="category" value='+records[i].category+' class="data-filter btn btn-default record-category-addon">'+records[i].category+'</button><span class="record-date">'+records[i].date+'</span><button class="delete-btn btn btn-danger btn-xs">Delete</button>'; 
				for (var ii = 0; ii < records[i].tags.length; ii++) {					
					var filterRecTags2 = filter[0].tags.find(function(element) {						
						return records[i].tags[ii] === element;
					});
					if (filterRecTags2) {
						recordString += '<button data-filter-type="tags" value="'
						+records[i].tags[ii]+'" class="data-filter tags btn btn-info btn-xs active">'
						+records[i].tags[ii]+'</button>';
					} else {
						recordString += '<button data-filter-type="tags" value="'
						+records[i].tags[ii]+'" class="data-filter tags btn btn-info btn-xs">'
						+records[i].tags[ii]+'</button>';
					}
				}
			recordString += '</div>'; 
			}
		}
	}

	recordsOutput.innerHTML += recordString;	
	dateSortListener();
	deleteListener();
	editListener();
	filterListener();
}

function submitNotes (e) {
	var recordCategory = this.getAttribute('value');			
	var noteTitle = document.getElementById('noteTitle').value;
	var noteBody = document.getElementById('noteBody').value;
	var customTags = document.getElementById('customNoteTags').value;
	var noteTagCont = document.getElementById('noteTags');
	var noteTags = noteTagCont.getElementsByTagName('button');
	var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0,	v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});

	if(!validateRecord(noteTitle, noteBody)){
		return false;
	}

	var customTagsArr = customTags.replace(/"/g, "'")
	.split(/,\s|\s,\s|\s,|\s{2,},|\s{2,}|,/)	
	.filter(function(x) { return x.trim() != ''; });	

	var note = {
		id: newId,
		category: [recordCategory],
		name: noteTitle,
		body: noteBody,
		date: new Date(),
		tags: []
	}	
	note.tags.push.apply(note.tags, customTagsArr);

	for (var i = 0; i < noteTags.length; i++) {
		if (noteTags[i].classList.contains('active') == true) {
			note.tags.push(noteTags[i].value);
			noteTags[i].classList.remove('active');
		}
	}
	document.getElementById('notesForm').reset();
	document.getElementById('noteBody').value="";		
	combiner(e, note);
}

function submitIdeas (e) {
	var recordCategory = this.getAttribute('value');			
	var ideaTitle = document.getElementById('ideaTitle').value;
	var ideaBody = document.getElementById('ideaBody').value;
	var customTags = document.getElementById('customIdeaTags').value;
	var ideaTagCont = document.getElementById('ideaTags');
	var ideaTags = ideaTagCont.getElementsByTagName('button');
	var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0,	v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});

	if(!validateRecord(ideaTitle, ideaBody)){
		return false;
	}

	var customTagsArr = customTags.replace(/"/g, "'")
	.split(/,\s|\s,\s|\s,|\s{2,},|\s{2,}|,/)	
	.filter(function(x) { return x.trim() != ''; });	

	var idea = {
		id: newId,
		category: [recordCategory],
		name: ideaTitle,
		body: ideaBody,
		date: new Date(),
		tags: []
	}	
	idea.tags.push.apply(idea.tags, customTagsArr);

	for (var i = 0; i < ideaTags.length; i++) {
		if (ideaTags[i].classList.contains('active') == true) {
			idea.tags.push(ideaTags[i].value);
			ideaTags[i].classList.remove('active');
		}
	}
	document.getElementById('ideasForm').reset();
	document.getElementById('ideaBody').value="";	
	combiner(e, idea);
}

function submitBookmarks (e) {
	var recordCategory = this.getAttribute('value');	
	var bookmarkTitle = document.getElementById('bookmarkTitle').value;
	var bookmarkUrl = document.getElementById('bookmarkUrl').value;
	var customTags = document.getElementById('customBookmarkTags').value;
	var bookmarkTagCont = document.getElementById('bookmarkTags');
	var bookmarkTags = bookmarkTagCont.getElementsByTagName('button');
	var newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0,	v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});

	if(!validateBookmark(bookmarkTitle, bookmarkUrl)){
		return false;
	}

	var customTagsArr = customTags.replace(/"/g, "'")
	.split(/,\s|\s,\s|\s,|\s{2,},|\s{2,}|,/)	
	.filter(function(x) { return x.trim() != ''; });	

	var bookmark = {
		id: newId,
		category: [recordCategory],
		name: bookmarkTitle,
		url: bookmarkUrl,
		date: new Date(),
		tags: []
	}
	
	bookmark.tags.push.apply(bookmark.tags, customTagsArr);

	for (var i = 0; i < bookmarkTags.length; i++) {
		if (bookmarkTags[i].classList.contains('active') == true) {
			bookmark.tags.push(bookmarkTags[i].value);
			bookmarkTags[i].classList.remove('active');
		}
	}
	
	document.getElementById('bookmarksForm').reset();	
	combiner(e, bookmark);
}

function combiner (e, value) {
	records.push(value);
	localStorage.setItem('records', JSON.stringify(records));
	fetchRecords();
	e.preventDefault();
}