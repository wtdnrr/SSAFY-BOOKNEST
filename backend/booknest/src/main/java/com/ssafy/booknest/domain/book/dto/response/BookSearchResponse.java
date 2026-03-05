package com.ssafy.booknest.domain.book.dto.response;

import com.ssafy.booknest.domain.book.enums.BookSearchType;
import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchResponse {
    private List<BookResponse> books;
    private int pageNumber;
    private int totalPages;
    private int totalElements;
    private int pageSize;
    private boolean first;
    private boolean last;
    private BookSearchType searchType;

    public static BookSearchResponse of(Page<BookResponse> page, int userPage, BookSearchType searchType) {
        return BookSearchResponse.builder()
                .books(page.getContent())
                .pageNumber(userPage)
                .totalPages(page.getTotalPages())
                .totalElements((int) page.getTotalElements())
                .pageSize(page.getSize())
                .first(page.isFirst())
                .last(page.isLast())
                .searchType(searchType)
                .build();
    }
}
