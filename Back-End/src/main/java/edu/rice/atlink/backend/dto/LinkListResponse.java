package edu.rice.atlink.backend.dto;

import java.util.List;

public record LinkListResponse(
        List<LinkResponse> items,
        String nextCursor
) {
}
