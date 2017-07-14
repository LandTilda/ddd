<?php

function mail_header_encode($str, $data_charset, $send_charset) {
	if($data_charset != $send_charset) {
		$str = iconv($data_charset, $send_charset.'//IGNORE', $str);
	}
	return '=?'.$send_charset.'?B?'.base64_encode($str).'?=';
}

function mail_send($name_from, $email_from, $name_to, $email_to, $data_charset, $send_charset, $subject, $body, $content_type = "text/plain") {
	$to = mail_header_encode($name_to, $data_charset, $send_charset).' <' . $email_to . '>';
	$subject = mail_header_encode($subject, $data_charset, $send_charset);
	$from =  mail_header_encode($name_from, $data_charset, $send_charset).' <' . $email_from . '>';
	if($data_charset != $send_charset) {
		$body = iconv($data_charset, $send_charset.'//IGNORE', $body);
	}
	$headers = "From: $from\r\n";
	$headers .= "Content-type: ".$content_type."; charset=$send_charset\r\n";
	return mail($to, $subject, $body, $headers);
}

$body = str_replace("</div><div>", "\n", $_POST['message']);
$body = str_replace(["<div>", "</div>"], ["\n", "\n"], $body);

$message  = "Имя: " . $_POST['name'] . "\r\n";
$message .= "Email: " . $_POST['email'] . "\r\n";
$message .= "Телефон: " . $_POST['phone'] . "\r\n\r\n";
$message .= $body;

//$message = wordwrap($message, 70, "\r\n");

mail_send($_POST['name'], $_POST['email'], "SOLAR Digital", "info@solardigital.com.ua", "UTF-8", "UTF-8", "Новая заявка с solardigital.com.ua", $message);