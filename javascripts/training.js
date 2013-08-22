// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "workerTraining",
			defaults = { position: "center" };

	// The actual plugin constructor
	function Plugin ( element, options ) {
			this.element = element;
			this.container = $(this.element);
			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.start_button = this.container.find(".start-training");
			this.sections = this.container.find("section");
			this.total_slides = this.sections.length;
			this.current_index = 0;
			this.training_action = "";
			this.init();
	}

	Plugin.prototype = {
		init: function () {
			// Place initialization logic here
			// You already have access to the DOM element and
			// the options via the instance, e.g. this.element
			// and this.settings
			// you can add more functions like the one below and
			// call them like so: this.yourOtherFunction(this.element, this.settings).
			this.get_quiz_question_answer();
			this.sections.hide();
			this.show_section(this.current_index);
			this.register_start_button(this.start_button)
		},

		get_quiz_question_answer: function(){
			var quiz_question_answers = {};
			$.each(this.sections, function(idx, section) {
				var question_answer = {};
				question_answer['question'] = $(section).find("question").text();
				question_answer['answer'] = $(section).find("answer").text();
				quiz_question_answers['section_' + idx.toString()] = question_answer;
				$(section).find("quiz").detach();
			});
			this.quiz_question_answers = quiz_question_answers;
		},


		start_training: function(){
			

		},

		register_start_button: function(ele){
			var that = this;
			ele.click(function(){
				that.training_action = "start";
				that.go_to_next_slide();
			})
		},
		
		show_section: function(idx){
			$(this.sections.hide()[idx]).show();
			this.current_slide = $(this.sections[idx]);
			console.log($(this.sections[idx]));
			this.remove_next_previous_button();			
		},

		go_to_prev_slide: function(){
			if(!this.is_first_slide()){
				this.show_section(this.current_index-1);				
				this.current_index -= 1;
				if(this.current_index > 0){
					this.add_next_previous_button(this.current_slide);
					this.register_next_prev_button();
					this.set_quiz_contents();
				}				
			}else{
				alert("ggoo");
			}
		},

		go_to_next_slide: function(){

			if(!this.is_last_slide()){

				this.show_section(this.current_index+1);				
				this.current_index += 1;

				if(this.current_index > 0 && this.current_index <= this.sections.length){
					this.add_next_previous_button(this.current_slide);
					this.register_next_prev_button();
				}
				this.set_quiz_contents();
			}else{
				this.end_training();
			}
		},

		hide_section: function(ele){
			ele.hide();
		},
		
		is_first_slide: function(){
			return this.current_index == 0;
		},

		is_last_slide: function(){
			return (this.current_index +1) == this.total_slides;
		},

		calculate_index: function (idx) {
			if(this.training_action == "start" && this.current_index < this.total_slides){
				return idx + 1;
			} else{
				if(this.training_action == "next" && this.current_index <= this.total_slides){

				}
				if(this.training_action == "prev" && this.current_index > 1){

				}
			}
		},

		add_next_previous_button: function(section){
			var html = "<div class=\"button\"><a href=\"javascript:\" class=\"prev\">Previous</a><a class=\"next\" href=\"javascript:\">Next</a></div>"
			section.append(html);
		},

		remove_next_previous_button: function(){
			$(".button").remove();
		},

		has_quiz: function(){
			return this.quiz_question_answers['section_'+this.current_index.toString()].question.length > 0 
		},

		register_next_prev_button: function(){
			that = this;
			this.current_slide.find('.next').click(function(){
				if(that.has_quiz()){
					that.setup_quiz();
				} else{
					that.go_to_next_slide();
				}
			});

			this.current_slide.find(".prev").click(function(){
				that.go_to_prev_slide();
			});
		},

		set_quiz_contents: function(){
			var question_answer = this.quiz_question_answers['section_' + this.current_index.toString()];
			console.log(question_answer);
			this.question = question_answer['question'];
			this.answer = question_answer['answer'];
			console.log("Q: " + this.question);
			console.log("A: " + this.answer);
		},
		
		end_training: function(){
			var html = "<div><p class=\"congratulate\">Congratulations!!! You have completed the Training Session :)</p><p><input type=\"button\" value=\"OK\"><p></div>";
			this.sections.hide();
			this.container.append(html);
		},

		setup_quiz: function(){
			console.log("Set Up");
			console.log("question: " + this.question);
			console.log("Answer: " + this.answer);
			that = this;
			var options = { 
				buttons: { 
					confirm: { 
						text: 'Okie', 
						className: 'blue', 
						action: function(e) {
							if(e.input != that.answer){
								Apprise('close'); 
								Apprise("Sorry, your answer is not correct.")
							} else{
								Apprise('close'); 
								that.go_to_next_slide();
							}
						} 
					}, 
				},
				input: true,
			};

			Apprise(this.question, options);
		}
	};

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		return this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});
	};

})( jQuery, window, document );