<?php 
/* 
Plugin Name: FrameBuzz Embedder 
Plugin URI: http://www.framebuzz.com/ 
Description: Description will appear here. 
Version: 0.0.4 
Author: FrameBuzz 
Author URI: http://www.framebuzz.com/ 
License: GPLv2 or later 
*/ 

add_action('init', 'init_framebuzz_method');
 
function init_framebuzz_method() {
   add_thickbox();
}

function framebuzz_activation() { 
} 
register_activation_hook(__FILE__, 'framebuzz_activation'); 

function framebuzz_deactivation() { 
} 
register_deactivation_hook(__FILE__, 'framebuzz_deactivation'); 

 
//add_action('wp_enqueue_scripts', 'framebuzz_scripts'); 
function framebuzz_scripts() { 
//   wp_register_script('thickbox_init', plugins_url('js/thickbox.de.js.js', __FILE__)); 
//   wp_enqueue_script('thickbox_init'); 
} 


//add a button to the content editor, next to the media button
//this button will show a popup that contains inline content
add_action('media_buttons_context', 'add_framebuzz_button');

//add some content to the bottom of the page 
//This will be shown in the inline modal
add_action('admin_footer', 'add_framebuzz_popup_content');

add_action('admin_menu', 'framebuzz_plugin_settings'); 

//action to add a custom button to the content editor
function add_framebuzz_button($context) {
    $default  = '[framebuzz src=http://frame.bz/v/_-uH4_kDfow width=640 height=440]';
    $href     = 'href="javascript:send_to_editor(\''.$default.'\');"';
    $href     = 'href="#TB_inline&width=750&inlineId=framebuzz_container"';
    $href     = 'href="#TB_inline?xx=xx&inlineId=framebuzz_container&width=750"';
    
    $context .= '<span class="button add_media"><a title="Add FrameBuzz video" class="thickbox"'.$href.'><span class="wp-media-buttons-icon"></span> Add FrameBuzz video</a></span>'; 
    return $context;
}

function add_framebuzz_popup_content() {
  include('framebuzz_style.php');
  include('framebuzz_popup_content.php');
}

function framebuzz_plugin_settings() { 
    add_menu_page('FrameBuzz Settings', 'FrameBuzz Settings', 'administrator', 'framebuzz_settings', 'framebuzz_display_settings'); 
} 

function framebuzz_display_settings() {
  include('framebuzz_style.php');
  include('framebuzz_display_settings.php');
}


if ( ! function_exists( 'framebuzz_embed_shortcode' ) ) :

	function framebuzz_enqueue_script() {
		wp_enqueue_script( 'jquery' );
	}
	add_action( 'wp_enqueue_scripts', 'framebuzz_enqueue_script' );
	
	function framebuzz_embed_shortcode( $atts, $content = null ) {
		$defaults = array(
			'src' => 'http://frame.bz/v/_-uH4_kDfow',
			'width' => '580',
			'height' => '360',
			'scrolling' => 'no',
			'class' => 'framebuzz-class',
			'frameborder' => '0'
		);

		foreach ( $defaults as $default => $value ) { // add defaults
			if ( ! @array_key_exists( $default, $atts ) ) { // hide warning with "@" when no params at all
				$atts[$default] = $value;
			}
		}

        $html  = "\n".'<!-- framebuzz plugin v.1.0 wordpress.org/plugins/framebuzz/ -->'."\n";
		$html .= '<iframe ';
        foreach( $atts as $attr => $value ) {
    		if( $value != '' ) { // adding all attributes
				$html .= ' ' . $attr . '="' . $value . '"';
			} else { // adding empty attributes
				$html .= ' ' . $attr;
			}
		}
		$html .= '></iframe>';
		return $html;
	}
	add_shortcode( 'framebuzz', 'framebuzz_embed_shortcode' );
   
	
endif;
?>