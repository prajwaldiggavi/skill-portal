package com.skillportal.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findByExternalId(String externalId);

    boolean existsByExternalId(String externalId);

    List<Job> findAllByOrderByPostedAtDesc();

    @Query("SELECT j FROM Job j WHERE " +
           "(:city IS NULL OR :city = '' OR LOWER(j.location) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY j.postedAt DESC")
    List<Job> findWithFilters(@Param("city") String city, @Param("keyword") String keyword);
}
