<div id="framebuzz_container" style="display:none;">
<script type="text/javascript">
  jQuery( document ).ready(function() {
    tb_init('a.thickbox');
  });    
  function framebuzz_video(video){
    var i = video.toLowerCase().indexOf("?v=");
    if (i >= 0){
      video = video.substring(i+3, 100);
    }
    var link  = '[framebuzz src=http://frame.bz/v/'+video+' width=640 height=440]';
    send_to_editor(link);
    tb_remove();
  }
</script>    

    <img alt="FrameBuzz" src="http://frame.bz/static/marketing/img/framebuzz_for_wordpress.png" class="fbimg">
    <div class="login-wrapper">
    <div class="box">
        <div class="fieldWrapper">
           <h4>Enter a YouTube video url to FrameBuzz</h4>
           <?php           
                $fbuzz_username = "fbuzz_username";
                if (isset($_POST[$fbuzz_username])) {
                    update_option( $fbuzz_username, $_POST[$fbuzz_username]);
                }
                $postto = $_SERVER['PHP_SELF'];
                $fbuzz_default = trim(get_option( $fbuzz_username, ""));
            ?>
           <div class="popup">
           <input type="text" placeholder="YouTube Video URL" id="yt_url" value="">
           <input type="button" class="btn-glow primary signup" value="FrameBuzz it" onclick="framebuzz_video(jQuery('#yt_url').val())">
           </div>
        </div>
    </div>
        <br/>
        <h5 id="tablemessage">Or Select from your registered YouTube ID</h5>
        <div id="framebuzz_table">
        <?php
            $geturl = "http://gdata.youtube.com/feeds/api/users/".$fbuzz_default."/uploads?v=2&alt=jsonc";
            $file = wp_remote_get($geturl);
            $json = json_decode($file["body"]);
            if (isset($json->error)){
              echo "<script type='text/javascript'>jQuery('#tablemessage').hide();</script>";
              echo '<font color="red">Your YouTube Id has not been set! &nbsp; </font><font color="#3A87AD">Please goto FrameBuzz Settings...</font>';
            }else{
                $json = $json->data;
                echo "<table align='center'>"; 
                echo "<tr> <th colspan='3'> ".$fbuzz_default." Channel Videos</th></tr>";
                foreach ($json->items as $row) {
                    echo "<tr>";
                    $fblink  = 'framebuzz_video("'.$row->id.'");';

                    echo "<td><input type='button' class='btn-glow primary signup' value='Select' onclick='".$fblink."'></td>";
                    echo "<td class='tdbbot'><img class='littleimg' src='".$row->thumbnail->sqDefault."'></td>";  
                    echo "<td class='tdbbot' width='100%' style='vertical-align:top;'>uploaded: ".substr($row->uploaded,0,10)."<br/>".$row->title."</td>";
                    echo "</tr>";
                }
                echo "</table>"; 
            }
        ?>
        </div>
    </div>
<br/>
</div>