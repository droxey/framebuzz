    <div class="login-wrapper">
    <img alt="FrameBuzz" src="http://frame.bz/static/marketing/img/framebuzz_for_wordpress.png" class="fbimg2">
    <div class="box">
        <div class="fieldWrapper">
           <h6>Register your YouTube ID</h6>
<?php           
    $fbuzz_username = "fbuzz_username";
    if (isset($_POST[$fbuzz_username])) {
        update_option( $fbuzz_username, $_POST[$fbuzz_username]);
    }
    $postto = $_SERVER['PHP_SELF'];
    $fbuzz_default = trim(get_option( $fbuzz_username, ""));
?>
        <form action="<?php echo $postto;?>?page=framebuzz_settings" method="post" name="options">
           <input type="text" placeholder="Enter YouTube User ID" name="fbuzz_username" maxlength="30" class="span12" value="<?php echo $fbuzz_default;?>">
           <input type="submit" class="btn-glow primary signup" value="Register">
           </form>
           <div class="getYTUN">
             Don't know your YouTube User ID? <a href="http://www.youtube.com/account_advanced" target="blank">Click here</a>
           </div>
        </div>
    </div>
        <br/>
        <div id="framebuzz_table">
        <?php
            $geturl = "http://gdata.youtube.com/feeds/api/users/".$fbuzz_default."/uploads?v=2&alt=jsonc";
            $file = wp_remote_get($geturl);
            $json = json_decode($file["body"]);
            
            if (isset($json->error)){
              if (trim($fbuzz_default) != '') {
                echo '<font color="red">'.$json->error->message.'</font>';
              }
            }else{
                $json = $json->data;
                echo "<table align='center'>"; 
                echo "<tr> <th colspan='2'> ".$fbuzz_default." Channel Videos</th></tr>";
                foreach ($json->items as $row) {
                    echo "<tr>";
                    echo "<td class='tdbbot'><img class='littleimg' src='".$row->thumbnail->sqDefault."'></td>";  
                    echo "<td class='tdbbot' width='100%' style='vertical-align:top;'>uploaded: ".substr($row->uploaded,0,10)."<br/>".$row->title."</td>";
                    echo "</tr>";
                }
                echo "</table>"; 
            }
        ?>
        </div>
    </div>