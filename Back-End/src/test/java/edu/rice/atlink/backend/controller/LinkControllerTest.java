package edu.rice.atlink.backend.controller;

import edu.rice.atlink.backend.model.UserRecord;
import edu.rice.atlink.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.storage.type=memory")
@AutoConfigureMockMvc
class LinkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void createLinkAndRedirect() throws Exception {
        mockMvc.perform(post("/api/links")
                        .header("Authorization", bearerToken("nana"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "longUrl": "https://www.rice.edu",
                                  "customAlias": "rice123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.alias").value("rice123"))
                .andExpect(jsonPath("$.shortUrl").value("http://localhost:8080/r/rice123"));

        mockMvc.perform(get("/r/rice123"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "https://www.rice.edu"));

        mockMvc.perform(get("/api/links/rice123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clickCount").value(1));
    }

    @Test
    void duplicateAliasReturnsConflict() throws Exception {
        String payload = """
                {
                  "longUrl": "https://www.google.com",
                  "customAlias": "atlas1"
                }
                """;

        mockMvc.perform(post("/api/links")
                        .header("Authorization", bearerToken("atlas-owner"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/links")
                        .header("Authorization", bearerToken("atlas-owner"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict());
    }

    @Test
    void listLinksRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/links"))
                .andExpect(status().isForbidden());
    }

    @Test
    void listLinksReturnsCursorPayload() throws Exception {
        mockMvc.perform(post("/api/links")
                        .header("Authorization", bearerToken("owner-1"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "longUrl": "https://www.example.com/one",
                                  "customAlias": "creator-a"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/links")
                        .header("Authorization", bearerToken("owner-1"))
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].alias").value("creator-a"))
                .andExpect(jsonPath("$.nextCursor").value(nullValue()));
    }

    private String bearerToken(String username) {
        UserRecord user = new UserRecord(username, username + "@example.com", "hash", Instant.now());
        return "Bearer " + jwtService.generateToken(user);
    }
}
