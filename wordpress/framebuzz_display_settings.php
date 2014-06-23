    <div class="login-wrapper">
    <img alt="FrameBuzz" src="http://frame.bz/static/framebuzz/marketing/img/framebuzz_for_wordpress.png" class="fbimg2">
    <div class="box">
        <div class="fieldWrapper">
           <h6>Register Your FrameBuzz Username</h6>
            <?php           
                $fbuzz_username = "fbuzz_username";
                if (isset($_POST[$fbuzz_username])) {
                    update_option( $fbuzz_username, $_POST[$fbuzz_username]);
                }
                $postto = $_SERVER['PHP_SELF'];
                $fbuzz_default = trim(get_option( $fbuzz_username, ""));
            ?>
            <form action="<?php echo $postto;?>?page=framebuzz_settings" method="post" name="options">
               <input type="text" placeholder="Enter FrameBuzz Username..." name="fbuzz_username" maxlength="30" class="span12" value="<?php echo $fbuzz_default;?>">
               <input type="submit" class="btn-glow primary signup" value="Register">
           </form>
        </div>
    </div>
    <br/>
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
                    echo "<tr><th colspan='2'>My Videos</th></tr>";
                    for ($i = 0; $i < count($json); $i++) {
                        $item = $json[$i];
                        echo "<tr>";
                        echo "<td class='tdbbot'><img class='littleimg' src='".$item->thumbnail."'></td>";  
                        echo "<td class='tdbbot' width='100%' style='vertical-align:top;'><strong>".$item->title."</strong><br>Uploaded: ".substr($item->added_on,0,10)."</td>";
                        echo "</tr>";
                    }
                    echo "</table>"; 
                }
            }
        ?>
    </div>
</div>