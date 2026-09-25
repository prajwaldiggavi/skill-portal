package com.skillportal.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findByExternalId(String externalId);

    boolean existsByExternalId(String externalId);

    Optional<Job> findFirstByCompanyIgnoreCaseAndTitleIgnoreCase(String company, String title);

    List<Job> findAllByOrderByPostedAtDesc();

    @Query("SELECT j FROM Job j WHERE " +
           "(:city IS NULL OR :city = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:source IS NULL OR :source = '' OR LOWER(j.sources) LIKE LOWER(CONCAT('%', :source, '%')) OR LOWER(j.source) LIKE LOWER(CONCAT('%', :source, '%'))) AND " +
           "(:onlyFresher IS NULL OR :onlyFresher = false OR j.isFresherEligible = true) AND " +
           "(:only2026 IS NULL OR :only2026 = false OR j.is2026Eligible = true) " +
           "ORDER BY j.relevanceScore DESC, j.postedAt DESC")
    List<Job> findWithAdvancedFilters(
            @Param("city") String city,
            @Param("keyword") String keyword,
            @Param("source") String source,
            @Param("onlyFresher") Boolean onlyFresher,
            @Param("only2026") Boolean only2026
    );

    @Query("SELECT j FROM Job j WHERE " +
           "(:city IS NULL OR :city = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY j.postedAt DESC")
    List<Job> findWithFilters(@Param("city") String city, @Param("keyword") String keyword);

    @Query("SELECT j FROM Job j WHERE j.is2026Eligible = true ORDER BY j.relevanceScore DESC, j.postedAt DESC")
    List<Job> findTopRecommendations();

    long countByPostedAtAfter(Instant after);

    long countByFetchedAtAfter(Instant after);

    @Query("SELECT COUNT(j) FROM Job j WHERE LOWER(j.title) LIKE '%java%' OR LOWER(j.description) LIKE '%java%'")
    long countJavaJobs();

    @Query("SELECT COUNT(j) FROM Job j WHERE (LOWER(j.title) LIKE '%full stack%' OR LOWER(j.description) LIKE '%full stack%') AND (LOWER(j.title) LIKE '%java%' OR LOWER(j.description) LIKE '%java%')")
    long countJavaFullStackJobs();

    long countByIsFresherEligibleTrue();

    long countByIs2026EligibleTrue();
}
