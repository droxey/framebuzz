<style>
body {
    color: #333333;
    font-family: "Open Sans",sans-serif;
    font-size: 12px;
    line-height: 20px;
}
div.navbar {
    background-color: #272727;
    box-shadow: none;
}
.navbar-inverse {
    margin-bottom: 0;
}
.navbar {
    overflow: visible;
}
.navbar-inner:before, .navbar-inner:after {
    display: table;
    line-height: 0;
}
.navbar-inner:after {
    clear: both;
}
.navbar-inner:before, .navbar-inner:after {
    display: table;
    line-height: 0;
}
div.navbar div.navbar-inner {
/*    background: radial-gradient(100% 100.42% at center 0 , rgba(255, 255, 255, 0.31) 0%, transparent 98%) repeat scroll 0 0 transparent; */
    border-left: 0 none;
    box-shadow: none;
    margin: 0 auto;
    overflow: hidden;
    width: 97%;
}
.navbar-inverse .navbar-inner {
    border-radius: 0 0 0 0;
}
.navbar-inner {
    min-height: 40px;
    padding-left: 20px;
    padding-right: 20px;
}
.wrapper {
    margin: 0 auto;
    width: 1200px;
}
div.navbar div.navbar-inner a.brand {
    border: medium none;
    padding: 8px 0 0 35px;
    text-shadow: none;
}
.navbar-inverse .brand {
    color: #FFFFFF;
    font-weight: lighter;
    text-transform: uppercase;
}
.navbar .brand {
    display: block;
    float: left;
    font-size: 20px;
    margin-left: -20px;
}
.getYTUN {
    margin-left: 300px;
    text-align: left;
    margin-top: 10px;
}
a img {
    border: medium none;
}
.fbimg {
    padding:20px 0px 0px 15px;
}
.fbimg2 {
    margin-left: -205px;
    padding: 20px 0 0;
}
.login-bg {
    background: linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) no-repeat scroll 0 0 #EFF0F3;
    height: 100%;
}

.header {
    background: none repeat scroll 0 0 #2C3742;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3) inset, 0 -1px 0 rgba(0, 0, 0, 0.22) inset, 0 1px 2px rgba(0, 0, 0, 0.14);
    height: 45px;
    padding-top: 28px;
    text-align: center;
    width: 100%;
}
.login-wrapper {
    text-align: center;
    margin-right: 10px;
    margin-left: 10px;
}
.login-wrapper .logo {
    left: -2px;
    margin-bottom: 45px;
    position: relative;
}
.login-wrapper .box {

    background-color: #D9EDF7;
    border-color: #BCE8F1;
    color: #3A87AD;
    
/*
    background: none repeat scroll 0 0 #3C89AF; 
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 0, 0, 0.35);
*/
    border-radius: 6px 6px 6px 6px;
    float: none;
    margin: 0 auto;
    padding: 20px 0;
    width: 400px;
}
.login-wrapper .box .content-wrap {
    margin: 0 auto;
    width: 82%;
}
.login-wrapper .box h6 {
    font-size: 18px;
    font-weight: 600;
    color:#3A87AD;
    margin:0px 0px 20px 0px;
}
.login-wrapper .box input[type="text"], .login-wrapper .box input[type="password"] {
    font-size: 15px;
    height: 35px;
    margin-bottom: 10px;
    padding-left: 12px;
    width:300px;
}
.login-wrapper .box input[type="text"]:focus, .login-wrapper .box input[type="password"]:focus {
    border: 1px solid #28A0E5;
    box-shadow: 0 1px 2px #DDDDDD inset, 0 0 5px #28A0E5;
    outline: medium none;
}
.login-wrapper .box input[type="password"] {
    margin-bottom: 10px;
}
.login-wrapper .box input:-moz-placeholder {
    color: #9BA8B6;
    font-size: 14px;
    font-style: italic;
    letter-spacing: 0;
}
.login-wrapper .box .action {
    background-color: #F4F5F6;
    border-radius: 0 0 7px 7px;
    border-top: 1px solid #D3D7DB;
    margin: 0 -36px;
    padding: 15px 0;
    position: relative;
    top: 30px;
}
.login-wrapper .box .signup {
    border-radius: 5px 5px 5px 5px;
    font-size: 13px;
    padding: 7px 25px;
    text-transform: uppercase;
    margin-top: -4px;
}
.login-wrapper .already {
    float: none;
    font-size: 13px;
    margin: 30px auto 0;
    text-align: center;
}
.login-wrapper .already p {
    color: #222222;
    display: inline-block;
}
.login-wrapper .already a {
    border-bottom: 1px solid;
    color: #222222;
    margin-left: 7px;
    transition: all 0.1s linear 0s;
}
.login-wrapper .already a:hover {
    border-bottom-color: #000000;
    color: #000000;
    text-decoration: none;
}
.login-wrapper .box {
    width: 350px;
}
.login-wrapper .box .action {
    margin: 0 -31px;
}
.login-wrapper .box {
    margin-top:5px;
    width: 600px;
}



.btn-glow.small {
    font-size: 11px;
    padding: 4px 7px;
}
.btn-glow.large {
    font-size: 14px;
    padding: 9px 16px;
}
.btn-glow {
    background: linear-gradient(to bottom, #FFFFFF 0%, #EEF0F1 100%) repeat scroll 0 0 transparent;
    border: 1px solid #E5E5E5;
    border-radius: 4px 4px 4px 4px;
    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.2) inset, 0 1px 0 0 #CCCCCC;
    color: #333333;
    cursor: pointer;
    display: inline-block;
    font-size: 13px;
    padding: 5px 10px;
    text-align: center;
    vertical-align: middle;
}
.btn-glow:hover {
    background: linear-gradient(to bottom, #FFFFFF 0%, #E6E6E6 100%) repeat scroll 0 0 transparent;
    text-decoration: none;
}
.btn-glow:active, .btn-glow.active {
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2) inset !important;
}
.btn-glow [class^="icon-"], .btn-glow [class*=" icon-"] {
    margin-right: 3px;
}
.btn-glow i.shuffle {
    top: 2px;
}
.btn-glow.inverse {
    background: linear-gradient(to bottom, #353F4C 0%, #222A33 100%) repeat scroll 0 0 transparent;
    border-color: #000000;
    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.5) inset;
    color: #FFFFFF;
}
.btn-glow.inverse:hover {
}
.btn-glow.primary {
    background: linear-gradient(#54B3FF, #0078D9) repeat scroll 0 0 transparent;
    border-color: #2480C2;
    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.5) inset;
    color: #FFFFFF;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
}
.btn-glow.primary:hover {
    background: linear-gradient(#389BEB, #0078D9) repeat scroll 0 0 transparent;
}
.btn-glow.primary:active {
    background: linear-gradient(#389BEB, #0078D9) repeat scroll 0 0 transparent;
}
.btn-glow.primary[disabled] {
    background: none repeat scroll 0 0 #81B7E2 !important;
    border: 0 none;
    box-shadow: none !important;
    cursor: default;
}
.btn-glow.success {
    background: linear-gradient(to bottom, #A9D651 0%, #96BF48 100%) repeat scroll 0 0 transparent;
    border: 1px solid #99BD56;
    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.5) inset;
    color: #FFFFFF;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.247);
}
#framebuzz_table table{
 text-align:left;
 border-spacing:0;
 border-collapse:collapse;
 float: none;
 margin: 0 auto;
 padding: 20px 0;
 width: 600px;
}
#framebuzz_table td{
 padding:10px 5px 10px 5px;
 text-align:left;
}
.tdbbot{
  border-bottom: 1px solid #BCE8F1;
}
#framebuzz_table th{
  padding:5px 5px 5px 10px;
  height:25px;
  text-align:left;
  background-color: #3C89AF;
  border-color: #3C89AF;
  color: #FFFFFF;
  font-size: 20px;
  font-weight:normal;
  text-transform:capitalize;
}

#TB_window #TB_title {
    background-color: #3C89AF;
    color: #CFCFCF;
}

.login-wrapper .box {
  margin-top: 5px !important;
}
.login-wrapper .popup input[type="text"] {
  width:400px;
}
h5 {
    font-size: 18px;
    font-weight: 600;
    color:#3C89AF;
    margin:0;
    padding-left: 25px;
    text-align: left;    
    margin:0px 0px 10px 0px;
}
.login-wrapper .box h4 {
    font-size: 18px;
    font-weight: 600;
    color: #3A87AD;
    margin:0px 0px 15px 0px;
    padding-left: 25px;
    text-align: left;    
}
.littleimg{
  height:60px;
  width:80px;
}
</style>