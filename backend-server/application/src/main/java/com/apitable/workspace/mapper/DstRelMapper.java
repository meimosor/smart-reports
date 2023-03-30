package com.apitable.workspace.mapper;

import com.apitable.workspace.entity.DstRelEntity;
import com.apitable.workspace.vo.DstRelInfoVo;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;

import java.util.Collection;
import java.util.List;

/**
 * datasheet lowcode relation mapper.
 */
public interface DstRelMapper extends BaseMapper<DstRelEntity> {

    /**
     * insert batch.
     *
     * @param entities nodes
     * @return affected rows
     */
    int insertBatch(@Param("entities") List<DstRelEntity> entities);

    /**
     * get the dst id by the formId id.
     *
     * @param formId formId
     * @return dst id
     */
    String selectDstIdByFormId(@Param("formId") String formId);


    /**
     * query record id.
     *
     * @param dataIds lowcode data ids
     * @return node id which not in rubbish
     */
    List<String> selectRecordIdsByDataIdIn(@Param("dataIds") List<String> dataIds);


    /**
     * query node info.
     *
     * @param dataIds  node ids
     * @return NodeInfoVos
     */
    List<DstRelInfoVo> selectDstRelInfoByRecordIds(@Param("dataIds") Collection<String> dataIds);



    /**
     * logical delete node（delete rubbish node）.
     *
     * @param recordId node id
     * @return affected rows
     */
    int updateIsDeletedByRecordId(@Param("recordId") String recordId);

    /**
     * logical delete node（delete rubbish node）.
     *
     * @param dstId node id
     * @return affected rows
     */
    int updateIsDeletedByDstId(@Param("dstId") String dstId);
}
