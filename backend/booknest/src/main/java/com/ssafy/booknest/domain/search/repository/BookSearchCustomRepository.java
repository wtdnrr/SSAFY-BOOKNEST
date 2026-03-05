package com.ssafy.booknest.domain.search.repository;

import com.ssafy.booknest.domain.search.record.BookEval;
import com.ssafy.booknest.domain.search.record.SearchedBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookSearchCustomRepository {

    // 새로운 도서 정보를 Elasticsearch에 저장
    void save(SearchedBook book);

    // 사용자의 도서 평가를 Elasticsearch에 저장
    void saveBookEval(BookEval book);

    // 태그와 키워드에 기반하여 도서를 검색 (페이징 포함)
    Page<SearchedBook> searchByTagsAndKeyword(List<String> tags, String keyword, Pageable pageable);

    // 사용자가 입력한 키워드로 도서 제목 자동완성 후보 리스트 반환
    List<String> autocompleteTitle(String keyword);
}
