<div id="framebuzz_container" style="display:none;">
<script type="text/javascript">
  jQuery( document ).ready(function() {
    tb_init('a.thickbox');
  });    
  function framebuzz_video(slug){
    var link  = '[framebuzz src=http://frame.bz/v/'+slug+'/ width=580 height=360]';
    send_to_editor(link);
    tb_remove();
  }
</script>    

    <img alt="FrameBuzz" src="http://framebuzz.com/static/framebuzz/marketing/img/framebuzz_for_wordpress.png" class="fbimg">
    <div class="login-wrapper">
        <?php           
            $fbuzz_username = "fbuzz_username";
            if (isset($_POST[$fbuzz_username])) {
                update_option( $fbuzz_username, $_POST[$fbuzz_username]);
            }
            $postto = $_SERVER['PHP_SELF'];
            $fbuzz_default = trim(get_option( $fbuzz_username, ""));
        ?>
        <br>
        <h5 id="tablemessage">Select from your uploaded videos:</h5>
        <br>
        <div id="framebuzz_table">
        <?php
            if (strlen($fbuzz_default) > 0) {
                $geturl = "http://framebuzz.com/api/videos/".$fbuzz_default."/";
                $file = wp_remote_get($geturl);
                $json = json_decode($file["body"]);
                if (isset($json->error) || count($json) == 0){
                  if (trim($fbuzz_default) != '') {
                    echo '<font color="red">There was an error processing your request. Please ensure your username is correct, and try again.</font>';
                  }
                } else{
                    echo "<table align='center'>"; 
                    echo "<tr><th colspan='3'>My Videos</th></tr>";
                    for ($i = 0; $i < count($json); $i++) {
                        $item = $json[$i];
                        $fblink  = 'framebuzz_video("'.$item->slug.'");';
                        echo "<tr>";
                        echo "<td class='tdbbot'><img class='littleimg' src='".$item->thumbnail."'></td>";  
                        echo "<td class='tdbbot' width='100%' style='vertical-align:top;'><strong>".$item->title."</strong><br>Uploaded: ".substr($item->added_on,0,10)."</td>";
                        echo "<td style='width: 10%;'><input type='button' class='btn-glow primary signup' value='Select' onclick='".$fblink."'></td>";
                        echo "</tr>";
                    }
                    echo "</table>"; 
                }
            }
            else {
              echo "<script type='text/javascript'>jQuery('#tablemessage').hide();</script>";
              echo '<font color="red">Your FrameBuzz username has not been set! &nbsp; </font><font color="#3A87AD">Please go to FrameBuzz Settings...</font>';
            }
        ?>
        </div>
    </div>
<br/>
</div>