package edu.rice.atlink.backend.repository;

import edu.rice.atlink.backend.model.LinkRecord;

import java.util.List;

public record LinkPage(List<LinkRecord> items, String nextCursor) {
}
