package com.nutrilius.app.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
  private final JavaMailSender mailSender;
  private final String from;

  public MailService(JavaMailSender mailSender, @Value("${app.mail.from}") String from) {
    this.mailSender = mailSender;
    this.from = from;
  }

  public void send(String to, String subject, String body) {
    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setFrom(from);
    msg.setTo(to);
    msg.setSubject(subject);
    msg.setText(body);
    mailSender.send(msg);
  }
}
