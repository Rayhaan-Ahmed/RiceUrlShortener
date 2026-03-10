package edu.rice.atlink.backend.controller;

import edu.rice.atlink.backend.dto.CreateLinkRequest;
import edu.rice.atlink.backend.dto.LinkListResponse;
import edu.rice.atlink.backend.dto.LinkResponse;
import edu.rice.atlink.backend.service.LinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
@RestController
@RequestMapping
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @PostMapping("/api/links")
    public ResponseEntity<LinkResponse> createLink(@Valid @RequestBody CreateLinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(linkService.createLink(request));
    }

    @GetMapping("/api/links/{alias}")
    public LinkResponse getLink(@PathVariable String alias) {
        return linkService.getLink(alias);
    }

    @GetMapping("/api/links")
    public LinkListResponse listLinks(
            @RequestParam String creatorId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return linkService.listLinks(creatorId, cursor, limit);
    }

    @GetMapping("/r/{alias}")
    public ResponseEntity<Void> redirect(@PathVariable String alias) {
        String longUrl = linkService.resolveRedirect(alias);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(longUrl).toString())
                .build();
    }
}
